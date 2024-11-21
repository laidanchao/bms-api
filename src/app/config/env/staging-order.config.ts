export default () => ({
  Bucket: {
    cms: 'ftl-cms-stage',
    oms: 'ftl-oms-staging',
  },
  OSC: {
    apiKey: 'LBn8nY2iLC4rycMzoc0gz8FayUWfdMFLX7EyDKdzwsTk1lN5F2',
  },
  Pod: {
    baseUrl: 'https://ats.ftlapp.io/api',
    apiKey: 'LBn8nY2iLC4rycMzoc0gz8FayUWfdMFLX7EyDKdzwsTk1lN5F2',
  },
  SM: {
    uri: 'https://gateway-api-staging.ftlapp.io/api/sm/callback',
    method: 'POST',
    headers: {
      Authorization:
        'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI1NDciLCJyb2xlcyI6IlJPTEVfQ01TX0FETUlOIiwidXNlcm5hbWUiOiJjbXMiLCJ0eXBlIjoiQURNSU4iLCJncm91cCI6IkNNUyIsIm93bmVyIjoiQ01TIiwibGFuZ3VhZ2UiOiJjbiIsInZlcnNpb24iOiJ2MS4zIiwidG9rZW5UeXBlIjoiQVBQIiwiYXBwIjoiODY4MWRjMzEtYTUzZS00Y2JkLWEyMjYtMWNkZmMxNzMzYTM2IiwiZW52Ijoic3RhZ2luZyIsImp0aSI6IjQzZGU5YzlhMTE4NzRhZTdhZGE4MTk1Yzk2Njc3OWM3In0.2G6xLAAEuYb0QV8jQsQeoi4bFbDQFvhHpDzYTGzFoIpEuwp4OPGqb7_F_rnNMOi3h3hqacwriwBf0RcaKrhgYQ',
      'Content-Type': 'application/json; charset=utf-8',
    },
    jobGroupName: 'CMS-API-CN',
  },
  SMS: {
    url: 'https://gateway-api-staging.ftlapp.io/api/sms',
    token:
      'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI4MDcwIiwicm9sZXMiOiJST0xFX1NNU19ST09UIiwidXNlcm5hbWUiOiJzbXNfYWRtaW4iLCJ0eXBlIjoiUk9PVCIsImdyb3VwIjoiUk9PVCIsIm93bmVyIjoiUk9PVCIsImxhbmd1YWdlIjoiY24iLCJ2ZXJzaW9uIjoidjEuMyIsInRva2VuVHlwZSI6IkFQUCIsImFwcCI6IlV6alB3bUQzYVpwWWhCd21WMEVCamxkSFlHSWwwUmhuIiwiZW52Ijoic3RhZ2luZyIsImp0aSI6IjY0Njc4YTVkNmE0MzRmNGJhNTllMmVhNzhiYTkyYjUyIn0.uesmAe7wQY6O7PTtE8JU0UoIb7hxYXUlaKumOJWwC-nY5SVoS22j3Ne_Na64S42ZDwBuVU05nAWarfWPf4LWHQ',
  },
  XPush2: {
    url: 'https://gateway-api-staging.ftlapp.io/api/kafka/enqueue',
    token:
      'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI1NDciLCJyb2xlcyI6IlJPTEVfQ01TX0FETUlOIiwidXNlcm5hbWUiOiJjbXMiLCJ0eXBlIjoiQURNSU4iLCJncm91cCI6IkNNUyIsIm93bmVyIjoiQ01TIiwibGFuZ3VhZ2UiOiJjbiIsInZlcnNpb24iOiJ2MS4zIiwidG9rZW5UeXBlIjoiQVBQIiwiYXBwIjoiODY4MWRjMzEtYTUzZS00Y2JkLWEyMjYtMWNkZmMxNzMzYTM2IiwiZW52Ijoic3RhZ2luZyIsImp0aSI6IjQzZGU5YzlhMTE4NzRhZTdhZGE4MTk1Yzk2Njc3OWM3In0.2G6xLAAEuYb0QV8jQsQeoi4bFbDQFvhHpDzYTGzFoIpEuwp4OPGqb7_F_rnNMOi3h3hqacwriwBf0RcaKrhgYQ',
  },
  Nacos: {
    serverAddr: 'nacos.ftlapp.io:443',
    namespace: 'staging',
    username: 'nacos',
    password: 'qCozxha0SzcZU',
  },
});
