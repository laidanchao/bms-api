export default () => ({
  ColispriveUpdateZipcodesJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.colisprive.com',
      port: '22',
      username: 'FTL_Express',
      password: 'uCUU8Qif',
      source: '/sftp/test_sftp/vers_FTL_Express',
      success: '/sftp/test_sftp/vers_FTL_Express/success',
      retry: '/sftp/test_sftp/vers_FTL_Express/retry',
    },
  },
  XBSTrackingJob: {
    ftp: {
      protocol: 'sftp',
      host: 'mtapi.net',
      port: '22',
      username: 'FTLExpress',
      password: 'XBS3469',
      success: '/OUT/success',
      source: '/OUT',
    },
  },
  ColissimoInvoiceUploadS3Job: {
    ftp: {
      protocol: 'sftp',
      host: '52.82.48.201',
      port: '22',
      username: 'colissimo-test',
      password: 'iD7Z47jyOUJcw',
      source: '/colissimo/invoice',
      uploaded: '/colissimo/invoice/uploaded',
    },
  },
  SM: {
    uri: 'http://gateway-v2-api.import-staging/api/sm/callback',
    method: 'POST',
    headers: {
      Authorization:
        'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI1NDciLCJyb2xlcyI6IlJPTEVfQ01TX0FETUlOIiwidXNlcm5hbWUiOiJjbXMiLCJ0eXBlIjoiQURNSU4iLCJncm91cCI6IkNNUyIsIm93bmVyIjoiQ01TIiwibGFuZ3VhZ2UiOiJjbiIsInZlcnNpb24iOiJ2MS4zIiwidG9rZW5UeXBlIjoiQVBQIiwiYXBwIjoiODY4MWRjMzEtYTUzZS00Y2JkLWEyMjYtMWNkZmMxNzMzYTM2IiwiZW52Ijoic3RhZ2luZyIsImp0aSI6IjQzZGU5YzlhMTE4NzRhZTdhZGE4MTk1Yzk2Njc3OWM3In0.2G6xLAAEuYb0QV8jQsQeoi4bFbDQFvhHpDzYTGzFoIpEuwp4OPGqb7_F_rnNMOi3h3hqacwriwBf0RcaKrhgYQ',
      'Content-Type': 'application/json; charset=utf-8',
    },
    jobGroupName: 'CMS-NEST-SCHEDULER',
  },
  XPush: {
    uri: 'http://gateway-staging.ftlapp.io',
    headers: {
      Authorization:
        'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI1NTAiLCJyb2xlcyI6IlJPTEVfWFBVU0hfQURNSU4iLCJ1c2VybmFtZSI6InhwdXNoIiwidHlwZSI6IkFETUlOIiwiZ3JvdXAiOiJNQU5BR0VSIiwib3duZXIiOiJNQU5BR0VSIiwibGFuZ3VhZ2UiOiJjbiIsInZlcnNpb24iOiJ2MS4zIiwidG9rZW5UeXBlIjoiQVBQIiwiYXBwIjoiaGt5OWpzcU90c0NYdXdmSEhvNll4cU9rU0MzNlAydUgiLCJlbnYiOiJzdGFnaW5nIiwianRpIjoiYjMxNTgyYzZhY2FjNGRkY2I2ZThiY2FkNTE5OGQyYTQifQ.6BBTUqiuJZfcbxnJi5_0fK_fsuP12uXS40swhNVCz8-s7IykTNFL3IhzODxrjs3jhSShSNRip8LLM9nJkDsVCg',
      'api-key': 'smnIK52FkU3WbrH9DPN1rBix4adX3OJn',
    },
  },
  XPush2: {
    url: 'https://gateway-api-staging.ftlapp.io/api/kafka/enqueue',
    token:
      'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI1NDciLCJyb2xlcyI6IlJPTEVfQ01TX0FETUlOIiwidXNlcm5hbWUiOiJjbXMiLCJ0eXBlIjoiQURNSU4iLCJncm91cCI6IkNNUyIsIm93bmVyIjoiQ01TIiwibGFuZ3VhZ2UiOiJjbiIsInZlcnNpb24iOiJ2MS4zIiwidG9rZW5UeXBlIjoiQVBQIiwiYXBwIjoiODY4MWRjMzEtYTUzZS00Y2JkLWEyMjYtMWNkZmMxNzMzYTM2IiwiZW52Ijoic3RhZ2luZyIsImp0aSI6IjQzZGU5YzlhMTE4NzRhZTdhZGE4MTk1Yzk2Njc3OWM3In0.2G6xLAAEuYb0QV8jQsQeoi4bFbDQFvhHpDzYTGzFoIpEuwp4OPGqb7_F_rnNMOi3h3hqacwriwBf0RcaKrhgYQ',
  },
  EMAIL: {
    host: 'smtp.gmail.com',
    secure: true,
    enabled: true,
    auth: {
      user: 'op@ftl-express.fr',
      pass: 'ftlexpress2017',
    },
  },
  Bucket: {
    cms: 'ftl-cms-stage',
    oms: 'ftl-oms-staging',
  },
  Indemnity: {
    url: 'http://gateway-uat.ftlapp.io/api/supports/update/compensate',
    token:
      'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl90ZXN0Iiwicm9sZXMiOiJBRE1JTl9XRU5aSEVOIiwidXNlcm5hbWUiOiJhZG1pbl90ZXN0IiwidHlwZSI6IkFETUlOIiwib3duZXIiOiJBRE1JTiIsImxhbmd1YWdlIjoiY24ifQ.2VFyT4MBo0dbFc7BYEDp_PAn-24ILqleWAQNyq3KHatWmeAuRh2YzRVg_8oXnCtXvjM1GIBdaPFHBwBwTDxILw',
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
      host: '47.88.29.118',
      protocol: 'sftp',
      port: '2222',
      username: 'sftltest',
      password: 'sFtltest@118',
      source: '/cm/tracking',
      extracted: '/cm/tracking/Extracted',
    },
  },
  CMESDTrackingExtractJob: {
    ftp: {
      host: '47.88.29.118',
      protocol: 'sftp',
      port: '2222',
      username: 'sftltest',
      password: 'sFtltest@118',
      source: '/cm/tracking',
      extracted: '/cm/tracking/Extracted',
    },
  },
  DISPEOESDTrackingExtractJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.esendeo.com',
      port: '22',
      username: 'esendeo',
      password: 'N4uObEBbk8QHejPO',
      source: '/local/test/Wait Extract',
      extracted: '/local/test/Extracted',
    },
  },
  CPTrackingExtractJob: {
    ftp: {
      host: '47.88.29.118',
      protocol: 'sftp',
      port: '2222',
      username: 'sftltest',
      password: 'sFtltest@118',
      source: '/cp/tracking',
      extracted: '/cp/tracking/success',
    },
  },
  MREsdTrackingExtractJob: {
    ftp: {
      host: '47.88.29.118',
      protocol: 'sftp',
      port: '2222',
      username: 'sftltest',
      password: 'sFtltest@118',
      source: '/mr/tracking/depuismrelay',
      extracted: '/mr/tracking/versmrelay',
    },
  },
  ClearCMFileRecordJob: {
    ftp: {
      host: '47.88.29.118',
      protocol: 'sftp',
      port: '2222',
      username: 'sftltest',
      password: 'sFtltest@118',
      source: '/cm/tracking/Extracted',
    },
  },
  ClearCMEsdFileRecordJob: {
    ftp: {
      host: '47.88.29.118',
      protocol: 'sftp',
      port: '2222',
      username: 'sftltest',
      password: 'sFtltest@118',
      source: '/cm/tracking/Extracted',
    },
  },
  ClearDISPEOEsdFileRecordJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.esendeo.com',
      port: '22',
      username: 'esendeo',
      password: 'N4uObEBbk8QHejPO',
      source: '/local/test/Extracted',
    },
  },
  ClearMREsdFileRecordJob: {
    ftp: {
      host: '47.88.29.118',
      protocol: 'sftp',
      port: '2222',
      username: 'sftltest',
      password: 'sFtltest@118',
      source: '/mr/tracking/versmrelay',
    },
  },
  ClearCPFileRecordJob: {
    ftp: {
      host: '47.88.29.118',
      protocol: 'sftp',
      port: '2222',
      username: 'sftltest',
      password: 'sFtltest@118',
      source: '/cp/tracking/success',
    },
  },
  PushTrackingFileToYunTuJob: {
    ftp: {
      protocol: 'sftp',
      host: 'dcltsftp.cmscentertech.com',
      port: '21',
      username: 'fr_colissimo',
      password: 'rmm5hDbP76xfI8XOyfbJ',
      source: '/test',
    },
  },
  CMTrackingExtractFromFTP: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.ftl-oms.com',
      port: '22',
      username: 'colissimo-test',
      password: 'qasdfrew',
      source: '/local/pushAgain',
    },
  },
  CHRONOPOST_Invoice: {
    ftp: {
      host: '47.88.29.118',
      protocol: 'sftp',
      port: '2222',
      username: 'sftltest',
      password: 'sFtltest@118',
      source: '/chronopost/invoice/DEMAT_DOUANE',
    },
  },
  BaseUrl: {
    CMSNestApi: 'https://gateway-staging.ftlapp.io/api/cms',
  },
  EventPushJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp-edi.coliposte.fr',
      port: '2222',
      username: 'ftlexpress_clp',
      password: 'Bc%1dH8kM3tqZa0',
      source: '/TEST',
    },
  },
  OSC: {
    apiKey: 'LBn8nY2iLC4rycMzoc0gz8FayUWfdMFLX7EyDKdzwsTk1lN5F2',
  },
  Pod: {
    baseUrl: 'https://ats.ftlapp.io/api',
    apiKey: 'LBn8nY2iLC4rycMzoc0gz8FayUWfdMFLX7EyDKdzwsTk1lN5F2',
  },
  OMS: {
    url: 'https://gateway-api-staging.ftlapp.io/api',
    token:
      'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzU2Iiwicm9sZXMiOiJST0xFX0JNU19ST09UIiwidXNlcm5hbWUiOiJqaW54aWFuZ3VvIiwidHlwZSI6IlJPT1QiLCJncm91cCI6IlJPT1QiLCJvd25lciI6IlJPT1QiLCJsYW5ndWFnZSI6ImNuIiwidmVyc2lvbiI6InYxLjMiLCJ0b2tlblR5cGUiOiJMT0dJTiIsImFwcCI6Ik55dUEyT3pXNndjZ21abVBqMXNLa0ZGUXZ1Y2d1RFRkIiwiZW52Ijoic3RhZ2luZyIsImp0aSI6ImYyMzU4ODA1MGQ4ZDQwOWVhYjUwOTBmNWNjNzM5MWUxIn0.9l4NlO2_jKRMkEmE840y3Yg2DiWu0yQtwSAcHvAkgCnoCrnXgVOx_qYkipRYyceklSKhcUH1uo8p73dMlzu_Ng',
  },
  SMS: {
    url: 'https://gateway-api-staging.ftlapp.io/api/sms',
    token:
      'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI4MDcwIiwicm9sZXMiOiJST0xFX1NNU19ST09UIiwidXNlcm5hbWUiOiJzbXNfYWRtaW4iLCJ0eXBlIjoiUk9PVCIsImdyb3VwIjoiUk9PVCIsIm93bmVyIjoiUk9PVCIsImxhbmd1YWdlIjoiY24iLCJ2ZXJzaW9uIjoidjEuMyIsInRva2VuVHlwZSI6IkFQUCIsImFwcCI6IlV6alB3bUQzYVpwWWhCd21WMEVCamxkSFlHSWwwUmhuIiwiZW52Ijoic3RhZ2luZyIsImp0aSI6IjY0Njc4YTVkNmE0MzRmNGJhNTllMmVhNzhiYTkyYjUyIn0.uesmAe7wQY6O7PTtE8JU0UoIb7hxYXUlaKumOJWwC-nY5SVoS22j3Ne_Na64S42ZDwBuVU05nAWarfWPf4LWHQ',
  },
  biMagicConfig: {
    url: 'https://gateway-api-staging.ftlapp.io/api/magic-api',
    token:
      'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzE0NiIsInJvbGVzIjoiUk9MRV9NQUdJQy1BUElfUk9PVCIsInVzZXJuYW1lIjoibWFnaWNBcGlBZG1pbiIsInR5cGUiOiJST09UIiwiZ3JvdXAiOiJST09UIiwib3duZXIiOiJST09UIiwibGFuZ3VhZ2UiOiJjbiIsInZlcnNpb24iOiJ2MS4zIiwidG9rZW5UeXBlIjoiQVBQIiwiYXBwIjoiazJJcTM1Z0Z5Z2xqVmowWHhCTmx2cWhoaktJVkFweHAiLCJlbnYiOiJzdGFnaW5nIiwianRpIjoiZDJlMGM2OTkzYjk5NDAxYmIwZGFmNWU1YWI1YTRkMmYifQ.muuFyJ5KWeOAauf6uwXnHOtjStG0GpNk7nWhFi81dZrNo1_FHrLuE14jt19RUBLuovY5ZDoVMDgmjqFr5Pl0Tw',
  },
  Nacos: {
    serverAddr: 'nacos.ftlapp.io:443',
    namespace: 'staging',
    username: 'nacos',
    password: 'qCozxha0SzcZU',
  },
});
