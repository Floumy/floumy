import {execa} from 'execa';

export async function startTestDb() {
    // Start a new PostgreSQL container
    await execa('podman', [
        'run',
        '--name', 'test-db',
        '-e', 'POSTGRES_DB=test',
        '-e', 'POSTGRES_USER=testuser',
        '-e', 'POSTGRES_PASSWORD=testpassword',
        '-d',
        'postgres'
    ]);
}

export async function stopTestDb() {
    // Stop and remove the PostgreSQL container
    await execa('podman', ['rm', '-f', 'test-db']);
}
