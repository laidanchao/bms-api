export default () => ({
  ColispriveUpdateZipcodesJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.colisprive.com',
      port: '22',
      username: 'FTL_Express',
      password: 'uCUU8Qif',
      source: '/sftp/vers_FTL_Express',
      success: '/sftp/vers_FTL_Express/success',
      retry: '/sftp/vers_FTL_Express/retry',
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
      host: 'sftp.ftlapp.io',
      port: '22',
      username: 'colissimo',
      password: 'qasdfrew',
      source: '/local/invoice',
      uploaded: '/local/invoice/uploaded',
    },
  },
  SM: {
    uri: 'https://gateway.ftlapp.io/api/sm/callback',
    method: 'POST',
    headers: {
      Authorization:
        'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxNCIsInJvbGVzIjoiUk9MRV9TTV9BRE1JTiIsInVzZXJuYW1lIjoic21fYWRtaW4iLCJ0eXBlIjoiQURNSU4iLCJncm91cCI6IkRFRkFVTFQiLCJvd25lciI6IkRFRkFVTFQiLCJsYW5ndWFnZSI6ImNuIiwidmVyc2lvbiI6InYxLjAiLCJ0b2tlblR5cGUiOiJDTElFTlQiLCJhcHAiOiJVanB2ZzdYREl0TXM3dVJoYnpzMUVPTG9yOVo1V0puTSIsImp0aSI6ImIyNmY0ZDVjZWU0MjQyNTBiZmFmMDc0Y2UzOTg4YWVhIn0.T5DVtk8LX9hzSNnqAh3ePfymiH1Td3HhMaHQWkUNrXLUBWcWKbai9Fh9uIPsOmX_lMFX5AsrSGKnsDp9nAYKjQ',
      'Content-Type': 'application/json; charset=utf-8',
    },
    jobGroupName: 'CMS-NEST-SCHEDULER',
  },
  XPush: {
    uri: 'https://gateway.ftlapp.io',
    headers: {
      Authorization:
        'Bearer  eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI1NDciLCJyb2xlcyI6IlJPTEVfQ01TX0FETUlOIiwidXNlcm5hbWUiOiJjbXMiLCJ0eXBlIjoiQURNSU4iLCJncm91cCI6IkNNU19BRE1JTiIsIm93bmVyIjoiQ01TX0FETUlOIiwibGFuZ3VhZ2UiOiJjbiIsInZlcnNpb24iOiJ2MS4xIiwidG9rZW5UeXBlIjoiQVBQIiwiYXBwIjoiODY4MWRjMzEtYTUzZS00Y2JkLWEyMjYtMWNkZmMxNzMzYTM2IiwianRpIjoiNTY2MjZjNzU1ZGRmNGM1MmJmNzY2ZTA4ZTFiMmY4YTUifQ.zl-w_m7MfgAbW1tzMNh9QZOHdsi1bRqcKRp3uUTYITm6xOwgY8ELLjLnZZZP7_FrvBCS_MaGu1-_vynmzV8jrA',
      'api-key': 'smnIK52FkU3WbrH9DPN1rBix4adX3OJn',
    },
  },
  XPush2: {
    url: 'https://auth.ftlapp.io/api/kafka/enqueue',
    token:
      'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI1NDciLCJyb2xlcyI6IlJPTEVfQ01TX0FETUlOIiwidXNlcm5hbWUiOiJjbXMiLCJ0eXBlIjoiQURNSU4iLCJncm91cCI6IkNNUyIsIm93bmVyIjoiQ01TIiwibGFuZ3VhZ2UiOiJjbiIsInZlcnNpb24iOiJ2MS4zIiwidG9rZW5UeXBlIjoiQVBQIiwiYXBwIjoiODY4MWRjMzEtYTUzZS00Y2JkLWEyMjYtMWNkZmMxNzMzYTM2IiwiZW52IjoicHJvZCIsImp0aSI6ImE3NTRlNWE3NmM2ZjQ4YjM4OTJlZmI1Mzk5YjM1OTk2In0.OqpK9Xi6gPhRBb9KChNny81AxGKj-BjHv2z7eCpoD9DHveBuJNXE53P9myxAP9McKkNwzdJWVPD4QzEFNF2m7w',
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
    cms: 'ftl-cms-prod',
    oms: 'ftl-oms',
  },
  Indemnity: {
    url: 'https://gateway.ftlapp.io/api/supports/update/compensate',
    token:
      'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJST09UIiwicm9sZXMiOiJST0xFX1JPT1QiLCJ1c2VybmFtZSI6InJvb3QiLCJ0eXBlIjoiUk9PVCIsImxhbmd1YWdlIjoiY24ifQ.ONBkvsjlsFow15z5X9HZ-WMJEWK3EzxY8o2aG_2-wdt0dabzpKjlCi_R00TUBGQiwDqLPwmAypcZ_MVbvHftUw',
  },
  ParcelSummaryJob: {
    dingDingIds: ['020022473240314640', '143119223235311130'],
  },
  ParcelAgingJob: {
    prefix: 'parcel/2021/',
    maxKeys: 10,
  },
  FileDistributeJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.ftlapp.io',
      port: '22',
      username: 'colissimo',
      password: 'qasdfrew',
      source: '/local/tracking',
    },
  },
  TrackingFileDistributeJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.ftlapp.io',
      port: '22',
      username: 'colissimo',
      password: 'qasdfrew',
      source: '/local',
    },
  },
  CMTrackingExtractJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.ftlapp.io',
      port: '22',
      username: 'colissimo',
      password: 'qasdfrew',
      source: '/local/tracking/Wait Extract',
      extracted: '/local/tracking/Extracted',
    },
  },
  CMESDTrackingExtractJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.esendeo.com',
      port: '22',
      username: 'esendeo',
      password: 'N4uObEBbk8QHejPO',
      source: '/local/tracking/Wait Extract',
      extracted: '/local/tracking/Extracted',
    },
  },
  DISPEOESDTrackingExtractJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.esendeo.com',
      port: '22',
      username: 'esendeo',
      password: 'N4uObEBbk8QHejPO',
      source: '/local/tracking_dispeo/Wait Extract',
      extracted: '/local/tracking_dispeo/Extracted',
    },
  },
  CPTrackingExtractJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.colisprive.com',
      port: '22',
      username: 'FTL_Express',
      password: 'uCUU8Qif',
      source: '/sftp/vers_FTL_Express/tracing',
      extracted: '/sftp/vers_FTL_Express/tracing/success',
    },
  },
  MREsdTrackingExtractJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.mondialrelay.com',
      port: '22',
      username: 'F2ESENDO',
      password: 'lje253t1vg6w4px',
      source: '/depuismrelay',
      extracted: '/versmrelay',
    },
  },
  ClearCMFileRecordJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.ftlapp.io',
      port: '22',
      username: 'colissimo',
      password: 'qasdfrew',
      source: '/local/tracking/Extracted',
    },
  },
  ClearCMEsdFileRecordJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.esendeo.com',
      port: '22',
      username: 'esendeo',
      password: 'N4uObEBbk8QHejPO',
      source: '/local/tracking/Extracted',
    },
  },
  ClearDISPEOEsdFileRecordJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.esendeo.com',
      port: '22',
      username: 'esendeo',
      password: 'N4uObEBbk8QHejPO',
      source: '/local/tracking_dispeo/Extracted',
    },
  },
  ClearMREsdFileRecordJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.mondialrelay.com',
      port: '22',
      username: 'F2ESENDO',
      password: 'lje253t1vg6w4px',
      source: '/versmrelay',
    },
  },
  ClearCPFileRecordJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp.colisprive.com',
      port: '22',
      username: 'FTL_Express',
      password: 'uCUU8Qif',
      source: '/sftp/vers_FTL_Express/tracing/success',
    },
  },
  PushTrackingFileToYunTuJob: {
    ftp: {
      protocol: 'ftp',
      host: 'dcltsftp.cmscentertech.com',
      port: '21',
      username: 'fr_colissimo',
      password: 'rmm5hDbP76xfI8XOyfbJ',
      source: '/local',
    },
  },
  CHRONOPOST_Invoice: {
    ftp: {
      host: 'sftp.chronopost.fr',
      protocol: 'sftp',
      port: '2222',
      username: 'esendeo',
      password: '2N4D#ee^3',
      source: '/DEMAT_DOUANE',
    },
  },
  BaseUrl: {
    CMSNestApi: 'https://gateway.ftlapp.io/api/cms',
  },
  EventPushJob: {
    ftp: {
      protocol: 'sftp',
      host: 'sftp-edi.coliposte.fr',
      port: '2222',
      username: 'ftlexpress_clp',
      password: 'Bc%1dH8kM3tqZa0',
      source: '/IN',
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
    url: 'https://gateway.ftlapp.io/api',
    token:
      'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzU2Iiwicm9sZXMiOiJST0xFX0JNU19ST09UIiwidXNlcm5hbWUiOiJqaW54aWFuZ3VvIiwidHlwZSI6IlJPT1QiLCJncm91cCI6IlJPT1QiLCJvd25lciI6IlJPT1QiLCJsYW5ndWFnZSI6ImNuIiwidmVyc2lvbiI6InYxLjIuMSIsInRva2VuVHlwZSI6IkFQUCIsImFwcCI6Ik55dUEyT3pXNndjZ21abVBqMXNLa0ZGUXZ1Y2d1RFRkIiwianRpIjoiNDdiMmM3MmUxMTUyNDM1NmJhZDYwMjE4ZTZmNDk3NjcifQ.vqxm1hOfFWfdujBq1Ho9saH87suZditrReYbedourorMUQBWZU2G1deoDh84DzcARp9zv3WTIdQfAWAYgj51PQ',
  },
  SMS: {
    url: 'http://sms-api.import-production/api',
    token:
      'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI4MDcwIiwicm9sZXMiOiJST0xFX1NNU19ST09UIiwidXNlcm5hbWUiOiJzbXNfYWRtaW4iLCJ0eXBlIjoiUk9PVCIsImdyb3VwIjoiUk9PVCIsIm93bmVyIjoiUk9PVCIsImxhbmd1YWdlIjoiY24iLCJ2ZXJzaW9uIjoidjEuMyIsInRva2VuVHlwZSI6IkFQUCIsImFwcCI6IlV6alB3bUQzYVpwWWhCd21WMEVCamxkSFlHSWwwUmhuIiwiZW52IjoicHJvZCIsImp0aSI6IjVjMGY0ZWRlNzkzMTQwZTBiZTdmYmYzNmNiNWRmYzExIn0.k_ypilyYgdeYEgaEukjZbpXhsjcJ8iZvrHLmwFKNgIbhFjtnx7O0RmBZVKKe6ZbECQcNHEQFN_ssrx0PIL9W4Q',
  },
  biMagicConfig: {
    url: 'https://gateway.ftlapp.io/api/magic-api',
    token:
      'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMTI3NyIsInJvbGVzIjoiUk9MRV9NQUdJQy1BUElfUk9PVCIsInVzZXJuYW1lIjoibWFnaWNBcGlBZG1pbiIsInR5cGUiOiJST09UIiwiZ3JvdXAiOiJST09UIiwib3duZXIiOiJST09UIiwibGFuZ3VhZ2UiOiJjbiIsInZlcnNpb24iOiJ2MS4zIiwidG9rZW5UeXBlIjoiQVBQIiwiYXBwIjoiTWp5cmZpVzdvbnFYT0dpNmltYjEyUHJIZ0dTWXZpT1MiLCJlbnYiOiJwcm9kIiwianRpIjoiMmIzMGNjODhkMzQ5NDk2MGFkZjYzYTk1Mjk5OGY4ZjkifQ.m_r9pLNGVRYM7JTu77lHmloUC0EsyR2CdG4FeAQjEEdBNG4wgyiv2hIzESDMTRIAdSPE_XhBMH0ZVKhXjqs0-w',
  },
  Nacos: {
    serverAddr: 'nacos.ftlapp.io:443',
    namespace: 'prod',
    username: 'nacos',
    password: 'qCozxha0SzcZU',
  },
});
