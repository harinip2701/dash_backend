FROM ubuntu:20.04
COPY timezone localtime /etc/
RUN mkdir -p /oncall
WORKDIR /oncall
COPY *.env *.json *.js /oncall/
COPY setup_14.sh /
RUN apt update && apt -y install vim curl wget gcc && apt -y install software-properties-common
RUN sh /setup_14.sh
RUN apt -y install nodejs
RUN npm init -y
RUN npm install express@4.17.1 
RUN npm install axios@0.21.1 
RUN npm install dotenv@8.2.0 
RUN npm install body-parser@1.19.0 
RUN npm install cors@2.8.5
EXPOSE 4008
CMD  [ "node" , "alert_status.js" ]
