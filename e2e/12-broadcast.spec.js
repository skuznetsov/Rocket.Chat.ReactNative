const {
	device, expect, element, by, waitFor
} = require('detox');
const OTP = require('otp.js');
const GA = OTP.googleAuthenticator;
const { takeScreenshot } = require('./helpers/screenshot');
const { logout, navigateToLogin, login, tapBack, sleep } = require('./helpers/app');
const { searchRoom } = require('./helpers/roomListView');
const data = require('./data');

// Tests randomly fail on Android platform - they can fail on:
// `before`, `should create broadcast room`, `should send message`,
// `should login as user without write message authorization and enter room`
// But running tests separately works ok.
describe('Broadcast room', () => {
	const broadcastRoom = `broadcast${ data.random }`;

		before(async () => {
			if (device.getPlatform() === 'ios') {
				await device.reloadReactNative();
			}
		});

		it('should create broadcast room', async () => {
			if (device.getPlatform() === 'ios') {
				await element(by.id('rooms-list-view-create-channel')).tap();
				await waitFor(element(by.id('new-message-view'))).toBeVisible().withTimeout(2000);
				await element(by.id('new-message-view-create-channel')).tap();
				await waitFor(element(by.id('select-users-view'))).toBeVisible().withTimeout(2000);
				await element(by.id(`select-users-view-item-${data.alternateUser}`)).tap();
				await waitFor(element(by.id(`selected-user-${data.alternateUser}`))).toBeVisible().withTimeout(5000);
				await element(by.id('selected-users-view-submit')).tap();
				await waitFor(element(by.id('create-channel-view'))).toBeVisible().withTimeout(5000);
				await element(by.id('create-channel-name')).replaceText(broadcastRoom);
				await element(by.id('create-channel-broadcast')).tap();
				await element(by.id('create-channel-submit')).tap();
				await waitFor(element(by.id('room-view'))).toBeVisible().withTimeout(60000);
				await expect(element(by.id('room-view'))).toBeVisible();
				await waitFor(element(by.text(broadcastRoom))).toExist().withTimeout(60000);
				await expect(element(by.text(broadcastRoom))).toExist();
				await element(by.id('room-view-header-actions')).tap();
				await waitFor(element(by.id('room-actions-view'))).toBeVisible().withTimeout(5000);
				await element(by.id('room-actions-info')).tap();
				await waitFor(element(by.id('room-info-view'))).toBeVisible().withTimeout(2000);
				await waitFor(element(by.id('room-info-view-broadcast'))).toBeVisible().withTimeout(2000);
				await expect(element(by.id('room-info-view-broadcast'))).toBeVisible();
				await tapBack();
				await waitFor(element(by.id('room-actions-view'))).toBeVisible().withTimeout(2000);
				await tapBack();
				await waitFor(element(by.id('room-view'))).toBeVisible().withTimeout(2000);
			}
		});

		it('should send message', async () => {
			if (device.getPlatform() === 'ios') {
				await waitFor(element(by.id('room-view'))).toBeVisible().withTimeout(5000);
				await element(by.id('messagebox-input')).tap();
				await element(by.id('messagebox-input')).typeText(`${data.random}message`);
				await element(by.id('messagebox-send-message')).tap();
				await waitFor(element(by.text(`${data.random}message`))).toBeVisible().withTimeout(60000);
				await expect(element(by.text(`${data.random}message`))).toBeVisible();
			}
		});

		it('should login as user without write message authorization and enter room', async () => {
			if (device.getPlatform() === 'ios') {
				await tapBack();
				await waitFor(element(by.id('rooms-list-view'))).toBeVisible().withTimeout(2000);
				await expect(element(by.id('rooms-list-view'))).toBeVisible();
				await logout();
				await navigateToLogin();
				// 2FA login in stable:detox
				await element(by.id('login-view-email')).replaceText(data.alternateUser);
				await element(by.id('login-view-password')).replaceText(data.alternateUserPassword);
				await element(by.id('login-view-submit')).tap();
				const code = GA.gen(data.alternateUserTOTPSecret);
				await element(by.id('login-view-totp')).replaceText(code);
				await element(by.id('login-view-submit')).tap();
				await waitFor(element(by.id('rooms-list-view'))).toBeVisible().withTimeout(10000);
				await searchRoom(broadcastRoom);
				await sleep(2000);
				await waitFor(element(by.id(`rooms-list-view-item-${broadcastRoom}`))).toExist().withTimeout(60000);
				await expect(element(by.id(`rooms-list-view-item-${broadcastRoom}`))).toExist();
				await element(by.id(`rooms-list-view-item-${broadcastRoom}`)).tap();
				await waitFor(element(by.id('room-view'))).toBeVisible().withTimeout(5000);
				await waitFor(element(by.text(broadcastRoom))).toExist().withTimeout(60000);
				await expect(element(by.text(broadcastRoom))).toExist();
			}
		});

		it('should not have messagebox', async () => {
			if (device.getPlatform() === 'ios') {
				await expect(element(by.id('messagebox'))).toBeNotVisible();
			}
		});

		it('should be read only', async () => {
			if (device.getPlatform() === 'ios') {
				await expect(element(by.text('This room is read only'))).toBeVisible();
			}
		});

		it('should have the message created earlier', async () => {
			if (device.getPlatform() === 'ios') {
				await waitFor(element(by.text(`${data.random}message`))).toBeVisible().withTimeout(60000);
				await expect(element(by.text(`${data.random}message`))).toBeVisible();
			}
		});

		it('should have reply button', async () => {
			if (device.getPlatform() === 'ios') {
				await expect(element(by.text('Reply'))).toBeVisible();
			}
		});

		it('should tap on reply button and navigate to direct room', async () => {
			if (device.getPlatform() === 'ios') {
				await element(by.text('Reply')).tap();
				await waitFor(element(by.text(data.user)).atIndex(0)).toBeVisible().withTimeout(60000);
				await expect(element(by.text(data.user)).atIndex(0)).toBeVisible();
			}
		});

		it('should reply broadcasted message', async () => {
			if (device.getPlatform() === 'ios') {
				await element(by.id('messagebox-input')).tap();
				await element(by.id('messagebox-input')).typeText(`${data.random}broadcastreply`);
				await element(by.id('messagebox-send-message')).tap();
				// await waitFor(element(by.text(`${ data.random }message`))).toBeVisible().withTimeout(60000);
				// await expect(element(by.text(`${ data.random }message`))).toBeVisible();
			}
		});

		afterEach(async () => {
			takeScreenshot();
		});

		after(async () => {
			if (device.getPlatform() === 'ios') {
				// log back as main test user and left screen on RoomsListView
				await tapBack();
				await waitFor(element(by.id('rooms-list-view'))).toBeVisible().withTimeout(2000);
				await logout();
				await navigateToLogin();
				await login();
			}
		})
});
