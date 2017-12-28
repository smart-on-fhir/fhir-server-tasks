# fhir-server-tasks
Maintenance web-hooks for FHIR servers


Example for broadcasting an event:

```sh
curl -X POST https://tasks.smarthealthit.org/broadcast \
  -H 'content-type: application/x-www-form-urlencoded' \
  -d 'secret=our-secret\
      &event=reset\
      &server=https%3A%2F%2Fsb-fhir-stu3.smarthealthit.org%2Fsmartstu3%2Fopen'
```