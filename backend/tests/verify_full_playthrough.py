"""Automated Full 90-Day Playthrough & Integration Verification Script.

Tests:
1. Complete 90-day Explorer mission end-to-end to Day 90 completion.
2. Complete 90-day Commander mission end-to-end to Day 90 completion.
3. Intentional early failure test (cutting life support to verify failure condition detection).
4. Mission Report and score validation.
"""

import httpx

API_BASE = "http://127.0.0.1:8000"
client = httpx.Client(base_url=API_BASE, timeout=10.0)


def run_full_mission(mode: str, label: str, seed: str):
    print(f"\n=======================================================")
    print(f"Launching Full 90-Day {mode} Mission: '{label}' (Seed: {seed})")
    print(f"=======================================================")

    headers = {"X-Browser-Id": f"playthrough_{mode.lower()}_test"}

    # 1. Create Mission
    res_create = client.post(
        "/api/missions",
        json={"difficulty_mode": mode, "label": label, "seed": seed},
        headers=headers,
    )
    assert res_create.status_code == 201, f"Failed to create mission: {res_create.text}"
    mission = res_create.json()
    mission_id = mission["id"]
    print(f"Mission initialized: {mission_id} on Day {mission['current_day']}")

    # Balanced nominal engineering decisions
    allocations = {
        "power_allocations": {
            "life_support": 12.0,
            "water_recycling": 8.0,
            "greenhouse": 10.0,
            "radiation_shelter": 0.0,
        },
        "water_allocations": {
            "crew_share": 4.0,
            "greenhouse_share": 2.0,
            "electrolysis_share": 1.0,
        },
        "oxygen_mode": "NOMINAL",
        "greenhouse_active": True,
        "storm_shelter_posture": False,
        "crew_rest_posture": False,
    }

    events_resolved_count = 0

    # Step through Day 1 to Day 90
    for day in range(1, 90):
        # Check if an emergency event is pending
        detail = client.get(f"/api/missions/{mission_id}", headers=headers).json()
        if detail.get("active_event") and detail["active_event"].get("requires_decision"):
            evt = detail["active_event"]
            if evt.get("resolution_status") == "PENDING":
                chosen_opt = evt["options"][0]["option_id"]
                res_resolve = client.post(
                    f"/api/missions/{mission_id}/events/{evt['event_id']}/resolve",
                    json={"chosen_option_id": chosen_opt},
                    headers=headers,
                )
                assert res_resolve.status_code == 200
                events_resolved_count += 1

        # Dynamic engineering adjustments:
        cur_allocations = dict(allocations)
        cur_allocations["power_allocations"] = dict(allocations["power_allocations"])
        cur_allocations["water_allocations"] = dict(allocations["water_allocations"])

        sys = detail["systems"]
        # If oxygen is high (>70), dial back electrolysis water to conserve potable water:
        if sys["oxygen_level"] > 70.0:
            cur_allocations["water_allocations"]["electrolysis_share"] = 0.5
        else:
            cur_allocations["water_allocations"]["electrolysis_share"] = 1.0

        # Balanced greenhouse strategy:
        # Keep greenhouse running until stored food safely covers the remaining mission days
        days_remaining = 90 - day
        food_needed = days_remaining * 4.0
        if sys["food_level"] >= (food_needed + 10.0) or sys["water_level"] <= 40.0:
            cur_allocations["greenhouse_active"] = False
            cur_allocations["water_allocations"]["greenhouse_share"] = 0.0
            cur_allocations["power_allocations"]["greenhouse"] = 0.0
        else:
            cur_allocations["greenhouse_active"] = True
            cur_allocations["water_allocations"]["greenhouse_share"] = 2.0
            cur_allocations["power_allocations"]["greenhouse"] = 10.0

        # Advance Day
        step_payload = {**cur_allocations, "expected_day": day}
        res_advance = client.post(
            f"/api/missions/{mission_id}/advance-day",
            json=step_payload,
            headers=headers,
        )
        assert res_advance.status_code == 200, f"Error advancing day {day}: {res_advance.text}"
        step_data = res_advance.json()

        if day % 15 == 0 or day == 89:
            print(
                f"Day {step_data['day_number']}/90 | Status: {step_data['mission_status']} | "
                f"O2: {step_data['system_levels']['oxygen_level']} | "
                f"Water: {step_data['system_levels']['water_level']} | "
                f"Battery: {step_data['system_levels']['battery_level']} | "
                f"Food: {step_data['system_levels']['food_level']}"
            )

        if step_data["mission_status"] != "IN_PROGRESS":
            print(f"Mission ended at Day {step_data['day_number']}: {step_data['mission_status']}")
            break

    # 3. Retrieve End-of-Mission Report
    res_report = client.get(f"/api/missions/{mission_id}/report", headers=headers)
    assert res_report.status_code == 200
    report = res_report.json()

    print(f"\nFinal Report Outcome: {report['outcome_status']}")
    print(f"Days Survived: {report['days_survived']}/90")
    if report.get("score_breakdown"):
        sb = report["score_breakdown"]
        print(f"Total Score: {sb['total_score']} pts")
        print(
            f"Breakdown -> Survival: {sb['crew_survival_score']}, Duration: {sb['duration_score']}, "
            f"Stewardship: {sb['resource_stewardship_score']}, Radiation: {sb['radiation_safety_score']}, "
            f"Quality: {sb['decision_quality_score']} (Multiplier: {sb['difficulty_multiplier_applied']}x)"
        )
    print(f"Total Daily Snapshots in DB: {len(report['telemetry_history'])}")
    print(f"Total Events Handled: {len(report['events_log'])}")
    print(f"Key Turning Points Recorded: {len(report['key_turning_points'])}")
    print(f"Educational Takeaways: {len(report['educational_takeaways'])}")

    assert report["outcome_status"] == "COMPLETED", f"Expected mission completion on Day 90, got {report['outcome_status']}"
    assert report["days_survived"] == 90
    assert len(report["telemetry_history"]) == 90
    assert all(c["survival_status"] != "DECEASED" for c in report["crew"])
    print(f"SUCCESS: Full 90-day {mode} mission completed and verified!\n")


def test_intentional_failure():
    print(f"\n=======================================================")
    print(f"Testing Intentional Early Failure Path (Life Support Cut)")
    print(f"=======================================================")

    headers = {"X-Browser-Id": "test_failure_path"}
    res_create = client.post(
        "/api/missions",
        json={"difficulty_mode": "COMMANDER", "label": "Failure Test Outpost", "seed": "FAIL_SEED"},
        headers=headers,
    )
    mission_id = res_create.json()["id"]

    # Starve oxygen by allocating 0 power to life support
    starvation_allocations = {
        "power_allocations": {"life_support": 0.0, "water_recycling": 0.0, "greenhouse": 0.0, "radiation_shelter": 0.0},
        "water_allocations": {"crew_share": 0.0, "greenhouse_share": 0.0, "electrolysis_share": 0.0},
        "oxygen_mode": "CONSERVATION",
        "greenhouse_active": False,
        "storm_shelter_posture": False,
        "crew_rest_posture": False,
    }

    failed = False
    for day in range(1, 90):
        # Resolve blocking event if one appeared
        detail = client.get(f"/api/missions/{mission_id}", headers=headers).json()
        if detail.get("active_event") and detail["active_event"].get("requires_decision"):
            evt = detail["active_event"]
            if evt.get("resolution_status") == "PENDING":
                chosen_opt = evt["options"][0]["option_id"]
                client.post(
                    f"/api/missions/{mission_id}/events/{evt['event_id']}/resolve",
                    json={"chosen_option_id": chosen_opt},
                    headers=headers,
                )

        res = client.post(
            f"/api/missions/{mission_id}/advance-day",
            json={**starvation_allocations, "expected_day": day},
            headers=headers,
        )
        if res.status_code == 200:
            data = res.json()
            if data["mission_status"] == "FAILED":
                failed = True
                print(f"Mission failed as expected on Day {data['day_number']}: {data['failure_reason']}")
                break
        else:
            print(f"Day advance returned {res.status_code}: {res.text}")
            break

    assert failed, "Expected mission to fail under total life-support starvation!"
    print("SUCCESS: Early failure path correctly identified and recorded!\n")


if __name__ == "__main__":
    run_full_mission("EXPLORER", "Explorer Expedition 1", "GOLDEN_EXPLORER_90")
    run_full_mission("COMMANDER", "Commander Expedition 1", "GOLDEN_COMMANDER_90")
    test_intentional_failure()
    print("ALL PLAYTHROUGH INTEGRATION TESTS PASSED PERFECTLY!")
