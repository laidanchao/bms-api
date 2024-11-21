import { execSync } from 'child_process';

export default async function() {
  execSync(
    '',
    // 'docker-compose stop test-db && docker-compose rm -f test-db && docker-compose stop test-redis && docker-compose rm -f test-redis',
  );
}
