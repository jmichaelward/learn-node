# Notes

## Chapter 4
The book example for the end of the chapter indicates to use `process.env.SERVERPORT` in `fibonacci-rest.js`, but
that causes the start process to fail because Node can't locate the value and thinks it's looking instead on
port 3000. The solution to fixing this is to add `SERVERPORT=3002` to the `start` script in `package.json`, just
like all of the other scripts, since the REST server relies on that value.
