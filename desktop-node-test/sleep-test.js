function msSleep(milliseconds) {
  const now = new Date();
  let current = null;
  do { current = new Date() }
  while( current - now < milliseconds )
}

const now = new Date();
console.log(now);
msSleep(200);
console.log(new Date() - now);