//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends egret.DisplayObjectContainer {

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        this.addExternalInterface();
    }

    private onAddToStage(event: egret.Event) {

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin

            context.onUpdate = () => {

            }
        })

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        this.runGame().catch(e => {
            console.log(e);
        })



    }

    private async runGame() {
        await this.loadResource()
        this.createGameScene();

        
        // const result = await RES.getResAsync("description_json")
        // this.startAnimation(result);
        // await platform.login();
        // const userInfo = await platform.getUserInfo();
        // console.log(userInfo);

    }

    private addExternalInterface() {
        var self = this;
        egret.ExternalInterface.addCallback("sendToJS", function(message:string){
            egret.ExternalInterface.call("sendToNative", "message = "+message);
            self.armature.animation.gotoAndPlay(message);
        });
    }

    private sendToJScallback(message: string){
        
    }

    private showMessage(message:string){
        //启动骨骼动画播放
        egret.ExternalInterface.call("sendToNative", this.armature.animation.lastAnimationName );
        this.armature.animation.gotoAndPlay(message);
    }
    


    private async loadResource() {
        try {
            const loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            await RES.loadConfig("resource/default.res.json", "resource/");
            await RES.loadGroup("preload", 0, loadingView);
            this.stage.removeChild(loadingView);
        }
        catch (e) {
            console.error(e);
        }
    }
    
    private  skeletonData ;
    private  textureData ;
    private  texture ;


/**骨骼角色拥有的动作列表**/
    private actionArray;
    /**骨骼角色执行的当前动作索引**/
    private actionFlag;
    /**存放骨骼动画的容器**/
    private container;
    /**骨骼的实体数据**/
    public armature;
    /**骨骼的可视对象**/
    private armatureDisplay;
    /**骨骼的可视对象**/
    private next_animation:string;;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {
        
        this.actionArray = ["think","hello"]
        this.container = new egret.DisplayObjectContainer();
        this.addChild(this.container);
        let stageW = this.stage.stageWidth;
        let stageH = this.stage.stageHeight;
        this.container.width = stageW;
        this.container.height = stageH;
        this.container.x = 150;
        this.container.y = 130;

        //读取一个骨骼数据,并创建实例显示到舞台
        this.skeletonData = RES.getRes("xcmascot_ske_json");
        this.textureData = RES.getRes("xcmascot_tex_json");
        this.texture = RES.getRes("xcmascot_tex_png");

        var factory = new dragonBones.EgretFactory();
        // factory.
        factory.addDragonBonesData(factory.parseDragonBonesData(this.skeletonData));
        factory.addTextureAtlasData(factory.parseTextureAtlasData(this.textureData, this.texture));

        this.armature = factory.buildArmature("xcmascot");
        this.armatureDisplay = this.armature.getDisplay();
        dragonBones.WorldClock.clock.add(this.armature);
        this.container.addChild(this.armatureDisplay);
        this.armatureDisplay.x = 0;
        this.armatureDisplay.y = 0;
        this.actionFlag = 0;      
        //启动骨骼动画播放
        this.armature.animation.gotoAndPlay(this.actionArray[this.actionFlag]);

		egret.startTick(this.onTicker, this);

        // this.myTimer = new egret.Timer(10);
        // this.myTimer.addEventListener(egret.TimerEvent.TIMER, this.onTimer, this);


    }
    
    private _time:number;
    private count:number;

    private onTicker(timeStamp:number) {

        if(!this._time) {
            this._time = timeStamp;
            this.count = timeStamp;
        }

        var now = timeStamp;
        var pass = now - this._time;
        this._time = now;
        this.count = this.count + pass;

        dragonBones.WorldClock.clock.advanceTime(pass / 1000);
        // egret.ExternalInterface.call("sendToNative", "this.next_animation = "+this.next_animation );
        if(!this.next_animation){
             return false;
        }
        if(this.count>5000){
            this.count = 0;
            this.actionFlag++;
            if (this.actionFlag == this.actionArray.length) {
                this.actionFlag = 0;
            }
            this.showMessage(this.next_animation);
        }
        return false;
    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name: string) {
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

   


}