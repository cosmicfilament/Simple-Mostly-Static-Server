# Simple Server

## A small simple nodejs server using express

Simple nodejs server that will serve react and/or static web pages.
This server has 2 default routes, a get and a post which are just placeholders and need to be fleshed out to return some real data.

### How to use

1. Modify the BASE_DIR and NODE_PORT to match your directory structure and nodejs port. Add any additional environment specific settings here.
2. There is a file called nodeConfig.js in the util subdirectory that has additional config settings which are not environment dependent.
3. The .env file should not be checked into your git repository and you should use a separate one for dev and production that will remain on their respective server.
4. The build directory is just a placeholder for the build directory you will create. It has a default index.html file in it so that the server will work correctly for testing right out of the box.
5. In the routes subdirectory there is a file called apiRouter.js that is a stub for a get request and a post request. The routes are called from the server.js file and should be commented out if you are only serving static web pages.
6. The logs subdirectory must be present in your server directory structure or log files will not be generated.

#### That's it