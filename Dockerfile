FROM nodered/node-red:1.2.6

RUN mkdir -p /tmp/interval-switch && cd /usr/src/node-red && npm install node-red-dashboard
COPY * /tmp/interval-switch
RUN cd /usr/src/node-red && npm install /tmp/interval-switch && npm install node-red-dashboard