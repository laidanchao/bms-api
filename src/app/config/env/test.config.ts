export default () => ({
  ColispriveTrackingJob: {
    ftp: {
      protocol: 'local',
      source: 'test/jobs/csv',
      success: 'test/jobs/csv',
      retry: 'test/jobs/csv',
    },
  },
  ColispriveUpdateZipcodesJob: {
    ftp: {
      protocol: 'local',
      source: 'test/jobs/zipcodes',
      success: 'test/jobs/zipcodes/success',
      retry: 'test/jobs/zipcodes/retry',
    },
  },
  PushColissimoTrackingFileJob: {
    ftp: {
      protocol: 'local',
      source: '/local/test',
      success: '/local/test/temp',
    },
    YUNFTP: {
      protocol: 'sftp',
      host: '8.209.64.189',
      port: '22',
      username: 'fr_colissimo',
      password: 'rmm5hDbP76xfI8XOyfbJ',
      source: '/test',
    },
  },
  XBSTrackingJob: {
    ftp: {
      protocol: 'local',
      success: 'test/jobs/csv',
      source: 'test/jobs/csv',
      host: 'mtapi.net',
      port: '22',
      username: 'FTLExpress',
      password: 'XBS3469',
    },
  },
  ColissimoInvoiceUploadS3Job: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.ftl-oms.com',
      port: '22',
      username: 'colissimo-test',
      password: 'qasdfrew',
      source: '/local/test/temp',
      success: '/local/test/temp-success',
      retry: '/local/test/temp-retry',
      uploaded: '/local/test/temp/uploaded',
    },
  },
  SM: {
    uri: 'http://gateway-v2-api.import-staging/api/sm/callback',
    method: 'POST',
    headers: {
      Authorization:
        'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxNCIsInJvbGVzIjoiUk9MRV9TTV9BRE1JTiIsInVzZXJuYW1lIjoic21fYWRtaW4iLCJ0eXBlIjoiQURNSU4iLCJncm91cCI6IkRFRkFVTFQiLCJvd25lciI6IkRFRkFVTFQiLCJsYW5ndWFnZSI6ImNuIiwidmVyc2lvbiI6InYxLjAiLCJ0b2tlblR5cGUiOiJDTElFTlQiLCJhcHAiOiJVanB2ZzdYREl0TXM3dVJoYnpzMUVPTG9yOVo1V0puTSIsImp0aSI6ImIyNmY0ZDVjZWU0MjQyNTBiZmFmMDc0Y2UzOTg4YWVhIn0.T5DVtk8LX9hzSNnqAh3ePfymiH1Td3HhMaHQWkUNrXLUBWcWKbai9Fh9uIPsOmX_lMFX5AsrSGKnsDp9nAYKjQ',
      'Content-Type': 'application/json; charset=utf-8',
    },
    jobGroupName: 'CMS-NEST-SCHEDULER',
  },
  XPush: {
    uri: 'http://gateway-api-staging.ftlapp.io',
    headers: {
      Authorization:
        'Bearer  eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI1NDciLCJyb2xlcyI6IlJPTEVfQ01TX0FETUlOIiwidXNlcm5hbWUiOiJjbXMiLCJ0eXBlIjoiQURNSU4iLCJncm91cCI6IkNNU19BRE1JTiIsIm93bmVyIjoiQ01TX0FETUlOIiwibGFuZ3VhZ2UiOiJjbiIsInZlcnNpb24iOiJ2MS4xIiwidG9rZW5UeXBlIjoiQVBQIiwiYXBwIjoiODY4MWRjMzEtYTUzZS00Y2JkLWEyMjYtMWNkZmMxNzMzYTM2IiwianRpIjoiNTY2MjZjNzU1ZGRmNGM1MmJmNzY2ZTA4ZTFiMmY4YTUifQ.zl-w_m7MfgAbW1tzMNh9QZOHdsi1bRqcKRp3uUTYITm6xOwgY8ELLjLnZZZP7_FrvBCS_MaGu1-_vynmzV8jrA',
      'api-key': 'smnIK52FkU3WbrH9DPN1rBix4adX3OJn',
    },
  },
  EMAIL: {
    host: 'smtp.gmail.com',
    secure: true,
    enabled: false,
    auth: {
      user: 'op@ftl-express.fr',
      pass: 'ftlexpress2017',
    },
  },
  Bucket: {
    cms: 'ftl-cms-staging',
    oms: 'ftl-oms-staging',
  },
  ParcelAgingJob: {
    prefix: 'parcel/2021/',
    maxKeys: 10,
  },
  FileDistributeJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.ftl-oms.com',
      port: '22',
      username: 'colissimo-test',
      password: 'qasdfrew',
      source: '/local',
    },
  },
  TrackingFileDistributeJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.ftl-oms.com',
      port: '22',
      username: 'colissimo-test',
      password: 'qasdfrew',
      source: '/local/statuts',
    },
  },
  CMTrackingExtractJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.ftl-oms.com',
      port: '22',
      username: 'colissimo-test',
      password: 'qasdfrew',
      source: '/local/tracking/Wait Extract',
    },
  },
  ClearFileRecordJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.ftl-oms.com',
      port: '22',
      username: 'colissimo-test',
      password: 'qasdfrew',
      source: '/local/tracking/Extracted',
    },
  },
  PushTrackingFileToYunTuJob: {
    ftp: {
      protocol: 'sftp',
      host: '8.209.64.189',
      port: '22',
      username: 'fr_colissimo',
      password: 'rmm5hDbP76xfI8XOyfbJ',
      source: '/test',
    },
  },
  CMTrackingExtractFromFTP: {
    ftp: {
      protocol: process.env.PROTOCOL,
      host: 'sftp.ftl-oms.com',
      port: '22',
      username: 'colissimo-test',
      password: 'qasdfrew',
      source: '/local/pushAgain',
    },
  },
  forJunitTest: {
    username: process.env.USER_NAME,
  },
  OMS: {
    url: 'f',
    token:
      'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzU2Iiwicm9sZXMiOiJST0xFX0JNU19ST09UIiwidXNlcm5hbWUiOiJqaW54aWFuZ3VvIiwidHlwZSI6IlJPT1QiLCJncm91cCI6IlJPT1QiLCJvd25lciI6IlJPT1QiLCJsYW5ndWFnZSI6ImNuIiwidmVyc2lvbiI6InYxLjMiLCJ0b2tlblR5cGUiOiJMT0dJTiIsImFwcCI6Ik55dUEyT3pXNndjZ21abVBqMXNLa0ZGUXZ1Y2d1RFRkIiwiZW52Ijoic3RhZ2luZyIsImp0aSI6ImYyMzU4ODA1MGQ4ZDQwOWVhYjUwOTBmNWNjNzM5MWUxIn0.9l4NlO2_jKRMkEmE840y3Yg2DiWu0yQtwSAcHvAkgCnoCrnXgVOx_qYkipRYyceklSKhcUH1uo8p73dMlzu_Ng',
  },
});
