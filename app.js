const { VK } = require('vk-io');
let chatId;
if (!process.env.ACCESS_TOKEN) {
    console.log('Ошибка запуска. Вы не указали токен доступа.')
    process.exit(0);
}
const vk = new VK({
    token: process.env.ACCESS_TOKEN
});
const { HearManager } = require('@vk-io/hear');
let userInfo;
let ignorePromo;
const tokens = [];
vk.api.users.get().then((res) => {
    userInfo = res[0];
})
vk.updates.on('message', async (ctx, next) => {
    if (ctx.peerId === -195809438 && ctx.text === '🔹 Вы получили 1 ключ по таймеру.') {
        vk.api.messages.send({peer_id: chatId, random_id: 0, message: 'Открыть контейнер'})
    }

    return next();
});

const hearManager = new HearManager();
 
vk.updates.on('message_new', hearManager.middleware);
 
hearManager.hear(/([a-z0-9]{4}-[a-z0-9]{4})/i, async (ctx) => {
    console.log(ctx.chatId);
    if (ignorePromo === ctx.$match[0] || process.env.PROMO_ID != ctx.chatId || ctx.$match[0] === '-') return;
    ignorePromo = ctx.$match[0];
    await vk.api.messages.send({peer_id: -195809438, random_id: 0, message: 'Ввести промокод'});
    setTimeout(() => vk.api.messages.send({peer_id: -195809438, random_id: 0, message: ctx.$match[0]}), 2000)
});

vk.updates.on('message', async (ctx) => {
    if (ctx.text === '!активировать' && ctx.senderId === userInfo.id) {
        chatId = ctx.peerId;
        ctx.reply('Теперь здесь будут открытия кейсов. :))))');
    }
})

vk.updates.start()
    .then(() => {
        console.log('Фармилка запущена.');
    })
    .catch((err) => {
        console.log('Ошибка запуска фармилки: ', err);
    })
