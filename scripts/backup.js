const { execSync } = require('child_process');

function run(cmd) {
    console.log(`\n> ${cmd}`);
    try {
        execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
        return true;
    } catch (e) {
        return false;
    }
}

function main() {
    const timestamp = new Date().toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).replace(/\//g, '-');

    console.log('=== Backup to GitHub ===');
    console.log(`Timestamp: ${timestamp}\n`);

    // Stage all changes
    run('git add .');

    // Check if there are changes to commit
    try {
        execSync('git diff --cached --quiet', { cwd: process.cwd() });
        console.log('\n✓ No changes to commit. Everything is up to date.');
        return;
    } catch (e) {
        // There are changes to commit
    }

    // Commit with timestamp
    const commitMessage = `Backup: ${timestamp}`;
    if (!run(`git commit -m "${commitMessage}"`)) {
        console.error('\n✗ Commit failed');
        process.exit(1);
    }

    // Push to remote
    if (!run('git push -u origin main')) {
        // Try with master branch if main fails
        console.log('\nTrying master branch...');
        if (!run('git push -u origin master')) {
            console.error('\n✗ Push failed');
            process.exit(1);
        }
    }

    console.log('\n✓ Backup completed successfully!');
}

main();
