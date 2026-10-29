/**
 * End-to-end smoke test against a running API instance.
 * Usage: npm run test:smoke   (server must be running)
 */

const baseUrl = process.env.API_URL ?? 'http://localhost:5000';
const marker = `Smoke ${Date.now()}`;

let passed = 0;
let failed = 0;
const cleanupIds = [];

function check(name, condition, detail) {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.error(`  FAIL  ${name}${detail ? ` -> ${JSON.stringify(detail)}` : ''}`);
  }
}

async function api(method, path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  return { status: response.status, body: payload };
}

async function main() {
  console.log(`Running smoke tests against ${baseUrl}\n`);

  const health = await api('GET', '/health');
  check('GET /health returns 200', health.status === 200);
  check('Database is connected', health.body?.data?.database === 'connected', health.body);

  const create = await api('POST', '/api/tasks', {
    title: `${marker} - title bravo`,
    description: 'Created by the automated smoke test',
    priority: 'high',
  });
  check('POST /api/tasks returns 201', create.status === 201, create.body);
  check('Created task defaults to pending', create.body?.data?.status === 'pending', create.body);
  check('Create response echoes payload', create.body?.data?.title === `${marker} - title bravo`);

  const firstId = create.body?.data?._id;
  if (firstId) {
    cleanupIds.push(firstId);
  }

  const second = await api('POST', '/api/tasks', {
    title: `${marker} - title alpha`,
    description: 'Second smoke task',
    priority: 'low',
    status: 'completed',
  });
  check('Create with explicit status returns 201', second.status === 201, second.body);
  const secondId = second.body?.data?._id;
  if (secondId) {
    cleanupIds.push(secondId);
  }

  const invalid = await api('POST', '/api/tasks', { description: 'missing title' });
  check('Missing title returns 400', invalid.status === 400, invalid.body);
  check('Validation error has details array', Array.isArray(invalid.body?.details), invalid.body);

  const invalidField = await api('POST', '/api/tasks', { title: 'x', owner: 'nobody' });
  check('Unknown field returns 400', invalidField.status === 400, invalidField.body);

  const list = await api('GET', `/api/tasks?search=${encodeURIComponent(marker)}&limit=10&sortBy=title&order=asc`);
  check('Search returns 200', list.status === 200, list.body);
  check('Search finds both tasks', list.body?.meta?.total === 2, list.body?.meta);
  check(
    'Sort by title ascending',
    list.body?.data?.[0]?.title === `${marker} - title alpha` &&
      list.body?.data?.[1]?.title === `${marker} - title bravo`,
    list.body?.data?.map((task) => task.title),
  );

  const page = await api(
    'GET',
    `/api/tasks?search=${encodeURIComponent(marker)}&page=1&limit=1&sortBy=title&order=asc`,
  );
  check('Pagination returns one item', page.body?.data?.length === 1, page.body);
  check('Pagination meta reports two pages', page.body?.meta?.totalPages === 2, page.body?.meta);

  const statusFilter = await api('GET', `/api/tasks?search=${encodeURIComponent(marker)}&status=completed`);
  check('Status filter returns only completed', statusFilter.body?.meta?.total === 1, statusFilter.body?.meta);

  const priorityFilter = await api('GET', `/api/tasks?search=${encodeURIComponent(marker)}&priority=high`);
  check('Priority filter returns only high', priorityFilter.body?.meta?.total === 1, priorityFilter.body?.meta);

  const badQuery = await api('GET', '/api/tasks?status=archived');
  check('Invalid status query returns 400', badQuery.status === 400, badQuery.body);

  const dashboard = await api('GET', '/api/dashboard');
  check('Dashboard returns 200', dashboard.status === 200, dashboard.body);
  check(
    'Dashboard totals add up',
    dashboard.body?.data?.total ===
      dashboard.body?.data?.pending +
        dashboard.body?.data?.inProgress +
        dashboard.body?.data?.completed,
    dashboard.body?.data,
  );
  check(
    'Dashboard completion rate is a percentage',
    Number.isInteger(dashboard.body?.data?.completionRate),
    dashboard.body?.data,
  );

  const fetched = await api('GET', `/api/tasks/${firstId}`);
  check('GET /api/tasks/:id returns 200', fetched.status === 200, fetched.body);

  const patch = await api('PATCH', `/api/tasks/${firstId}`, { status: 'completed', priority: 'low' });
  check('PATCH /api/tasks/:id returns 200', patch.status === 200, patch.body);
  check('PATCH applies changes', patch.body?.data?.status === 'completed' && patch.body?.data?.priority === 'low');

  const emptyPatch = await api('PATCH', `/api/tasks/${firstId}`, {});
  check('Empty PATCH returns 400', emptyPatch.status === 400, emptyPatch.body);

  const badPatch = await api('PATCH', `/api/tasks/${firstId}`, { status: 'done' });
  check('Invalid status PATCH returns 400', badPatch.status === 400, badPatch.body);

  const invalidId = await api('GET', '/api/tasks/not-an-object-id');
  check('Invalid ObjectId returns 400', invalidId.status === 400, invalidId.body);

  const missing = await api('GET', '/api/tasks/000000000000000000000000');
  check('Unknown task returns 404', missing.status === 404, missing.body);

  const unknownRoute = await api('GET', '/api/nope');
  check('Unknown route returns 404', unknownRoute.status === 404, unknownRoute.body);

  const remove = await api('DELETE', `/api/tasks/${firstId}`);
  check('DELETE /api/tasks/:id returns 200', remove.status === 200, remove.body);
  cleanupIds.splice(cleanupIds.indexOf(firstId), 1);

  const removedAgain = await api('DELETE', `/api/tasks/${firstId}`);
  check('Second DELETE returns 404', removedAgain.status === 404, removedAgain.body);
}

main()
  .catch((error) => {
    failed += 1;
    console.error('Smoke test crashed:', error);
  })
  .finally(async () => {
    for (const id of cleanupIds) {
      try {
        await api('DELETE', `/api/tasks/${id}`);
      } catch {
        // Best-effort cleanup.
      }
    }

    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed === 0 ? 0 : 1);
  });
