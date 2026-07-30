const admin = require('firebase-admin');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineString } = require('firebase-functions/params');
const { logger } = require('firebase-functions');

admin.initializeApp();

const GAME_URL = defineString('GAME_URL', {
  default: 'https://tuan0974316576-glitch.github.io/english_synonym/'
});

exports.sendDailyChallengeReminder = onSchedule(
  {
    schedule: '0 19 * * *',
    timeZone: 'Asia/Hong_Kong',
    region: 'asia-east1'
  },
  async () => {
    const snapshot = await admin.database().ref('users').once('value');
    const tokens = [];

    snapshot.forEach(userSnap => {
      const tokenMap = userSnap.child('fcmTokens').val() || {};
      Object.entries(tokenMap).forEach(([tokenKey, tokenInfo]) => {
        if (!tokenInfo || !tokenInfo.token || tokenInfo.enabled !== true) return;
        tokens.push({
          userKey: userSnap.key,
          tokenKey,
          token: tokenInfo.token
        });
      });
    });

    if (!tokens.length) {
      logger.info('No FCM tokens found.');
      return;
    }

    const chunkSize = 500;
    for (let i = 0; i < tokens.length; i += chunkSize) {
      const chunk = tokens.slice(i, i + chunkSize);
      const response = await admin.messaging().sendEachForMulticast({
        tokens: chunk.map(item => item.token),
        notification: {
          title: '同義詞の鬼',
          body: '今日未練 synonym，返嚟闖一關啦。'
        },
        webpush: {
          fcmOptions: {
            link: GAME_URL.value()
          }
        }
      });

      response.responses.forEach((result, index) => {
        if (result.success) return;
        const code = result.error?.code || '';
        const tokenInfo = chunk[index];
        logger.warn('Failed to send push', { tokenKey: tokenInfo.tokenKey, code });

        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          admin.database().ref(`users/${tokenInfo.userKey}/fcmTokens/${tokenInfo.tokenKey}`).remove();
        }
      });
    }

    logger.info(`Daily challenge reminder processed for ${tokens.length} tokens.`);
  }
);
