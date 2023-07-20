
import { _decorator, Component, Label, Button, TiledUserNodeData, sys } from 'cc';
import { Console } from './prefabs/console';
const { ccclass, property } = _decorator;

type PlacementID = {
    Interstitial: string,
    Rewarded: string,
    MREC: string,
    Banner: string,
}

const AndroidPlacementID: PlacementID = {
    Interstitial: "48259-8929383",
    Rewarded: "29363-0677875",
    MREC: "MREC1-7949503",
    Banner: "BANNER1-3238751",
}

const iOSPlacementID: PlacementID = {
    Interstitial: "INTERSTITIAL2-2226596",
    Rewarded: "REWARDED1-1969662",
    MREC: "MREC1-0854313",
    Banner: "BANNER1-2686018",
}

type ButtonDicts = {
    [index: string]: Button;
}

type AdStatus = {
    [index: string]: boolean;
}

function isAndroid (): boolean {
    return sys.platform === sys.Platform.ANDROID;
}

function isIOS (): boolean {
    return sys.platform === sys.Platform.IOS;
}

function getPlacementId (adType: string): string {
    let placementID: PlacementID;
    if (isAndroid()) {
        placementID = AndroidPlacementID;
    } else if (isIOS()) {
        placementID = iOSPlacementID;
    } else {
        return;
    }

    if (adType == "interstitial") {
        return placementID.Interstitial;
    } else if (adType == "rewarded") {
        return placementID.Rewarded;
    } else if (adType == "mrec") {
        return placementID.MREC;
    } else if (adType == "banner") {
        return placementID.Banner;
    }
}

function getAdConfig (adType: string): vungle.AdConfig {
    let adSize: vungle.AdSize = vungle.AdSize.BANNER;
    if (adType == "mrec") {
        adSize = vungle.AdSize.MREC;
    }
    const adConfig: vungle.AdConfig = {
        muted: true,
        orientation: vungle.OrientationType.AUTO_ROTATE,
        incentivizedFields: {
            userID: "test_user_id",
            title: "Careful!",
            body: "Are you sure you want to skip this ad? If you do, you might not get your reward",
            keepWatching: "Continue",
            close: "close",
        },
        ordinal: 1,
    }
    return adConfig;
}

function getBannerConfig (adType: string): vungle.BannerConfig {
    let adSize: vungle.AdSize = vungle.AdSize.BANNER_SHORT;
    if (adType == "mrec") {
        adSize = vungle.AdSize.MREC;
    }
    const bannerConfig: vungle.BannerConfig = {
        adSize: adSize,
        muted: false,
    }
    return bannerConfig;
}

/**
 * Predefined variables
 * Name = Startup
 * DateTime = Thu Sep 23 2021 18:06:40 GMT+0800 (中国标准时间)
 * Author = liwenyi
 * FileBasename = startup.ts
 * FileBasenameNoExtension = startup
 * URL = db://assets/startup.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('Startup')
export class Startup extends Component {
    loadButtons: ButtonDicts;
    playButtons: ButtonDicts;
    closeButtons: ButtonDicts;
    isAdPlaying: AdStatus;

    @property({ type: Console })
    console: Console = null!;

    @property({ type: Label })
    interstitalLabel: Label = null!;
    @property({ type: Button })
    interstitalLoad: Button = null!;
    @property({ type: Button })
    interstitalPlay: Button = null!;

    @property({ type: Label })
    rewardedLabel: Label = null!;
    @property({ type: Button })
    rewardedLoad: Button = null!;
    @property({ type: Button })
    rewardedPlay: Button = null!;

    @property({ type: Label })
    MRECLabel: Label = null!;
    @property({ type: Button })
    MRECLoad: Button = null!;
    @property({ type: Button })
    MRECPlay: Button = null!;
    @property({ type: Button })
    MRECClose: Button = null!;

    @property({ type: Label })
    bannerLabel: Label = null!;
    @property({ type: Button })
    bannerLoad: Button = null!;
    @property({ type: Button })
    bannerPlay: Button = null!;
    @property({ type: Button })
    bannerClose: Button = null!;

    start () {
        this.nodeInit();
        const vungleCallbacks: vungle.VungleCallbacks = {
            init: {
                onSuccess: () => {
                    this.vungleLog('init success');
                    this.initButtons();
                },
                onError: (error: string) => {
                    this.vungleLog(`init error: ${error}`);
                }
            },
            load: {
                onAdLoad: (placementId: string) => {
                    this.vungleLog(`ad is loaded: ${placementId}`);
                    this.enablePlayButton(placementId);
                },
                onError: (placementId: string, error: string) => {
                    this.vungleLog(`load ad(${placementId}) error: ${error}`);
                }
            },
            play: {
                onAdStart: (placementId: string) => {
                    this.vungleLog(`ad start: ${placementId}`);
                    this.isAdPlaying[placementId] = true;
                    this.disablePlayButton(placementId);
                },
                onAdViewed: (placementId: string) => {
                    this.vungleLog(`ad viewed: ${placementId}`);
                },
                onAdEnd: (placementId: string) => {
                    this.vungleLog(`ad end: ${placementId}`);
                    this.isAdPlaying[placementId] = false;
                },
                onAdClick: (placementId: string) => {
                    this.vungleLog(`ad click: ${placementId}`);
                },
                onAdRewarded: (placementId: string) => {
                    this.vungleLog(`ad rewarded: ${placementId}`);
                },
                onAdLeftApplication: (placementId: string) => {
                    this.vungleLog(`ad left application: ${placementId}`);
                },
                onError: (placementId: string, error: string) => {
                    this.vungleLog(`ad(${placementId}) error: ${error}`);
                },

                creativeId: (creativeId: string) => {
                    this.vungleLog(`creative id: ${creativeId}`);
                },

                // on IOS
                onAdWillShow: (placementId: string) => {
                    this.vungleLog(`ad will show: ${placementId}`);
                },
                onAdWillClose: (placementId: string) => {
                    this.vungleLog(`ad will close: ${placementId}`);
                },
            }
        }
        vungle.vungleService.setLogDebug(true);
        vungle.vungleService.setCallbacks(vungleCallbacks);
        const vungleSetting: vungle.Setting = {
            minimumDiskSpaceForInit: 55,   // MB
            minimumDiskSpaceForAd: 56,   // MB
            restrictAndroidID: true,
            setPublishIDFV: true,
        }
        vungle.vungleService.init(vungleSetting);

        this.vungleLog(`GDPR status: ${vungle.vungleService.getConsentStatus()}`);
        this.vungleLog(`GDPR version: ${vungle.vungleService.getConsentMessageVersion()}`);
        vungle.vungleService.updateConsentStatus(vungle.ConsentStatus.OPTED_OUT, "1.0.0");
        this.vungleLog(`GDPR status: ${vungle.vungleService.getConsentStatus()}`);
        this.vungleLog(`GDPR version: ${vungle.vungleService.getConsentMessageVersion()}`);

        this.vungleLog(`CCPA status: ${vungle.vungleService.getCCPAStatus()}`);
        vungle.vungleService.updateCCPAStatus(vungle.ConsentStatus.OPTED_OUT);
        this.vungleLog(`CCPA status: ${vungle.vungleService.getCCPAStatus()}`);
    }

    loadAd (event: Event, adType: string) {
        const placementId = getPlacementId(adType);
        if (vungle.vungleService.isInitialized()) {
            this.vungleLog(`${adType}:${placementId} is loading ...`);
            vungle.vungleService.loadAd(placementId);
        } else {
            this.vungleLog('vungle is not initialized');
        }
    }

    playAd (event: Event, adType: string) {
        const placementId = getPlacementId(adType);
        const adConfig: vungle.AdConfig = getAdConfig(adType);
        if (vungle.vungleService.canPlayAd(placementId)) {
            this.vungleLog(`play ${adType}:${placementId}`);
            vungle.vungleService.playAd(placementId, adConfig);
        } else {
            this.vungleLog(`ad cannot play:${placementId}`);
        }
    }

    loadBanner (event: Event, adType: string) {
        const placementId = getPlacementId(adType);
        const bannerConfig: vungle.BannerConfig = getBannerConfig(adType);
        if (vungle.vungleService.isInitialized()) {
            this.vungleLog(`${adType}:${placementId} is loading ...`);
            vungle.vungleService.loadBanner(placementId, bannerConfig);
        } else {
            this.vungleLog('vungle is not initialized');
        }
    }

    getBanner (event: Event, adType: string) {
        const placementId = getPlacementId(adType);
        const bannerConfig: vungle.BannerConfig = getBannerConfig(adType);
        if (vungle.vungleService.canPlayBanner(placementId, bannerConfig)) {
            this.vungleLog(`play ${adType}:${placementId}`);
            if (adType == 'mrec') {
                vungle.vungleService.getBanner(placementId, bannerConfig, vungle.BannerPosition.TOP);
            } else {
                vungle.vungleService.getBanner(placementId, bannerConfig, vungle.BannerPosition.BOTTOM);
            }
        } else {
            this.vungleLog(`banner cannot play:${placementId}`);
        }
    }

    destroyBanner (event: Event, adType: string) {
        const placementId = getPlacementId(adType);
        this.vungleLog(`destroy ${adType}:${placementId}`);
        vungle.vungleService.destroyBanner(placementId);
        this.disableCloseButton(placementId);
    }

    nodeInit () {
        let placementID: PlacementID;
        if (isAndroid()) {
            placementID = AndroidPlacementID;
        } else if (isIOS()) {
            placementID = iOSPlacementID;
        } else {
            placementID = iOSPlacementID;
            // return
        }
        // set label content
        this.interstitalLabel.string = `Interstitial: ${placementID.Interstitial}`;
        this.rewardedLabel.string = `Rewarded: ${placementID.Rewarded}`;
        this.MRECLabel.string = `MREC: ${placementID.MREC}`;
        this.bannerLabel.string = `Banner: ${placementID.Banner}`;

        // init params
        this.loadButtons = {
            [placementID.Interstitial]: this.interstitalLoad,
            [placementID.Rewarded]: this.rewardedLoad,
            [placementID.MREC]: this.MRECLoad,
            [placementID.Banner]: this.bannerLoad,
        }

        this.playButtons = {
            [placementID.Interstitial]: this.interstitalPlay,
            [placementID.Rewarded]: this.rewardedPlay,
            [placementID.MREC]: this.MRECPlay,
            [placementID.Banner]: this.bannerPlay,
        }

        this.closeButtons = {
            [placementID.MREC]: this.MRECClose,
            [placementID.Banner]: this.bannerClose,
        }

        this.isAdPlaying = {
            [placementID.Interstitial]: false,
            [placementID.Rewarded]: false,
            [placementID.MREC]: false,
            [placementID.Banner]: false,
        }
    }

    initButtons () {
        this.vungleLog("init buttons");
        for (let placementId of Object.keys(this.loadButtons)) {
            this.vungleLog(`enable button placementid:${placementId}`);
            const button: Button = this.loadButtons[placementId];
            button.interactable = true;
        }
        for (let placementId of Object.keys(this.playButtons)) {
            this.vungleLog(`disable button placementid:${placementId}`);
            const button: Button = this.playButtons[placementId];
            button.interactable = false;
        }
        for (let placementId of Object.keys(this.closeButtons)) {
            this.vungleLog(`disable button placementid:${placementId}`);
            const button: Button = this.closeButtons[placementId];
            button.interactable = false;
        }
    }

    enablePlayButton (placementID: string) {
        const loadButton = this.loadButtons[placementID];
        const playButton = this.playButtons[placementID];
        const closeButton = this.closeButtons[placementID];

        if (this.isAdPlaying[placementID] == false) {
            if (loadButton) {
                loadButton.interactable = false;
            }

            if (playButton) {
                playButton.interactable = true;
            }

            if (closeButton) {
                closeButton.interactable = false;
            }
        }
    }

    disablePlayButton (placementID: string) {
        const loadButton = this.loadButtons[placementID];
        const playButton = this.playButtons[placementID];
        const closeButton = this.closeButtons[placementID];

        if (playButton) {
            playButton.interactable = false;
        }

        if (closeButton) {
            closeButton.interactable = true;
        } else {
            loadButton.interactable = true;
        }
    }

    disableCloseButton (placementID: string) {
        const loadButton = this.loadButtons[placementID];
        const closeButton = this.closeButtons[placementID];

        if (closeButton) {
            closeButton.interactable = false;
            loadButton.interactable = true;
        }
    }

    vungleLog (msg: string) {
        console.info("ServiceVungleDemo::", msg);
        this.console.log("ServiceVungleDemo::", msg);
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.3/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.3/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.3/manual/zh/scripting/life-cycle-callbacks.html
 */
