module.exports = {
  apps : [{
    name   : "alu-learn",
    script : "pnpm",
    cwd    : "/home/aluadmin/aludir3/apps/alu-learn",
    args   : "start",
  }, {
    name   : "alu-cron",
    // script : "node /home/aluadmin/aludir3/apps/alu-learn/cron/_cron.mjs",
    script : "node /home/aluadmin/aludir2/cron/_cron.mjs",
    cwd    : "/home/aluadmin/aludir2",
  }],
};