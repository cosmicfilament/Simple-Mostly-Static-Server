# Simple Server

## a small simple nodejs server using express

Simple nodejs server that will serve react and/or static web pages.
This server has 2 default routes, a get and a post. They obviously are just placeholders and need to be fleshed out to return whatever you require.

### How to use

1. Modify the BASE_DIR and NODE_PORT as required.
2. There is a file called nodeConfig.js in the util subdirectory that also has config settings.
3. The .env file should not be checked into your git repository. There should be a separate one for dev and production.
4. The build directory is just a placeholder for the build directory you will create.
5. in the routes subdirectory is a default route javascript file that you will need to modify if you plan on doing any http requests other than static web pages.
