export default () => ({
  Bucket: {
    cms: 'ftl-cms-prod',
    oms: 'ftl-oms',
  },
  OSC: {
    apiKey: 'LBn8nY2iLC4rycMzoc0gz8FayUWfdMFLX7EyDKdzwsTk1lN5F2',
  },
  Pod: {
    baseUrl: 'https://ats.ftlapp.io/api',
    apiKey: 'LBn8nY2iLC4rycMzoc0gz8FayUWfdMFLX7EyDKdzwsTk1lN5F2',
  },
  SM: {
    uri: 'https://gateway.ftlapp.io/api/sm/callback',
    method: 'POST',
    headers: {
      Authorization:
        'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxNCIsInJvbGVzIjoiUk9MRV9TTV9BRE1JTiIsInVzZXJuYW1lIjoic21fYWRtaW4iLCJ0eXBlIjoiQURNSU4iLCJncm91cCI6IkRFRkFVTFQiLCJvd25lciI6IkRFRkFVTFQiLCJsYW5ndWFnZSI6ImNuIiwidmVyc2lvbiI6InYxLjAiLCJ0b2tlblR5cGUiOiJDTElFTlQiLCJhcHAiOiJVanB2ZzdYREl0TXM3dVJoYnpzMUVPTG9yOVo1V0puTSIsImp0aSI6ImIyNmY0ZDVjZWU0MjQyNTBiZmFmMDc0Y2UzOTg4YWVhIn0.T5DVtk8LX9hzSNnqAh3ePfymiH1Td3HhMaHQWkUNrXLUBWcWKbai9Fh9uIPsOmX_lMFX5AsrSGKnsDp9nAYKjQ',
      'Content-Type': 'application/json; charset=utf-8',
    },
    jobGroupName: 'CMS-API-CN',
  },
  SMS: {
    url: 'https://gateway.ftlapp.io/api/sms',
    token:
      'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI4MDcwIiwicm9sZXMiOiJST0xFX1NNU19ST09UIiwidXNlcm5hbWUiOiJzbXNfYWRtaW4iLCJ0eXBlIjoiUk9PVCIsImdyb3VwIjoiUk9PVCIsIm93bmVyIjoiUk9PVCIsImxhbmd1YWdlIjoiY24iLCJ2ZXJzaW9uIjoidjEuMyIsInRva2VuVHlwZSI6IkFQUCIsImFwcCI6IlV6alB3bUQzYVpwWWhCd21WMEVCamxkSFlHSWwwUmhuIiwiZW52IjoicHJvZCIsImp0aSI6IjVjMGY0ZWRlNzkzMTQwZTBiZTdmYmYzNmNiNWRmYzExIn0.k_ypilyYgdeYEgaEukjZbpXhsjcJ8iZvrHLmwFKNgIbhFjtnx7O0RmBZVKKe6ZbECQcNHEQFN_ssrx0PIL9W4Q',
  },
  XPush2: {
    url: 'https://auth.ftlapp.io/api/kafka/enqueue',
    token:
      'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI1NDciLCJyb2xlcyI6IlJPTEVfQ01TX0FETUlOIiwidXNlcm5hbWUiOiJjbXMiLCJ0eXBlIjoiQURNSU4iLCJncm91cCI6IkNNUyIsIm93bmVyIjoiQ01TIiwibGFuZ3VhZ2UiOiJjbiIsInZlcnNpb24iOiJ2MS4zIiwidG9rZW5UeXBlIjoiQVBQIiwiYXBwIjoiODY4MWRjMzEtYTUzZS00Y2JkLWEyMjYtMWNkZmMxNzMzYTM2IiwiZW52IjoicHJvZCIsImp0aSI6ImE3NTRlNWE3NmM2ZjQ4YjM4OTJlZmI1Mzk5YjM1OTk2In0.OqpK9Xi6gPhRBb9KChNny81AxGKj-BjHv2z7eCpoD9DHveBuJNXE53P9myxAP9McKkNwzdJWVPD4QzEFNF2m7w',
  },
  Nacos: {
    serverAddr: 'nacos.ftlapp.io:443',
    namespace: 'prod',
    username: 'nacos',
    password: 'qCozxha0SzcZU',
  },
});
