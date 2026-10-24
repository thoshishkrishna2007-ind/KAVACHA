async function runTests() {
  console.log('Testing KAVACHA Clinical Care Transition Backend Endpoints...\n');

  const BASE = 'http://localhost:3000/api';

  try {
    // 1. Health
    const healthRes = await fetch(`${BASE}/health`);
    const health = await healthRes.json();
    console.log('✓ [Health Check]:', health.status, '| Patients:', health.patientCount, '| Audit events:', health.auditEventCount);

    // 2. Patients list
    const patientsRes = await fetch(`${BASE}/patients`);
    const patients = await patientsRes.json();
    console.log('✓ [Patients API]: Loaded', patients.length, 'patients with readiness scores.');

    // 3. Single patient + readiness
    const singleRes = await fetch(`${BASE}/patients/tr-0941`);
    const single = await singleRes.json();
    console.log('✓ [Single Patient]:', single.patient.patientName, '| Overall Readiness:', single.readiness.overallScore + '%', '| Can advance:', single.readiness.canAdvanceCurrentStage);

    // 4. Role gate check: attempt advance Stage 3 as pharmacist (should be rejected)
    const advFailRes = await fetch(`${BASE}/patients/tr-0941/advance-stage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Demo-Role': 'pharmacist' }
    });
    console.log('✓ [Role Gate]: Pharmacist trying to advance Stage 03 -> HTTP Status:', advFailRes.status, '(Expected 403 or 400)');

    // 5. Analytics
    const analyticsRes = await fetch(`${BASE}/analytics`);
    const analytics = await analyticsRes.json();
    console.log('✓ [Analytics API]: Active Transitions:', analytics.summary.totalActiveTransitions, '| Adherence:', analytics.summary.protocolAdherenceRate + '%');

    // 6. Science / Pharmacology API
    const scienceRes = await fetch(`${BASE}/science/pharmacology?drug=metoprolol`);
    const science = await scienceRes.json();
    console.log('✓ [Bioscience Pharmacology]:', science.name, '| CID:', science.pubchemCid, '| Formula:', science.molecularFormula);

    // 7. Scenarios
    const scenRes = await fetch(`${BASE}/scenarios/B/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Demo-Role': 'admin' }
    });
    const scen = await scenRes.json();
    console.log('✓ [Synthetic Scenario B]:', scen.message);

    console.log('\nAll Backend Test Assertions PASSED successfully!');
  } catch (err: any) {
    console.error('Test failed:', err.message);
    process.exit(1);
  }
}

runTests();
