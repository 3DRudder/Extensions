chrome.runtime.sendMessage({}, function(response) {
    // default params
    var settings = {
        playpause: {axis:"pitch", threshold:0.2},
        forwardrewind: {axis:"roll", speed:5, threshold:0.2},
        volume: {axis:"yaw", threshold:0.2}
    };

    var injector = {
        SDK: new Sdk3dRudder()
    }

    // get default params
    chrome.storage.sync.get(settings, (items) => {        
        settings = items;
        
        initializeWhenReady(document);
    });

    // update params
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if (namespace === "sync")
            for (key in changes)
                settings[key] = changes[key].newValue;                
    });

    var forEach = Array.prototype.forEach;

    function defineVideoController() {
        injector.videoController = function(target, parent) {
            if (target.dataset['3drid']) {
                return;
            }

            this.video = target;            
            this.parent = target.parentElement || parent;
            this.document = target.ownerDocument;
            this.id = Math.random().toString(36).substr(2, 9); 
            // TODO initialize only if 3dRudder SDK is connected
            this.SDK = injector.SDK;
            if(this.SDK.connection === undefined) {
                this.SDK.init();
                var _this = this;
                this.SDK.on('init', function () {                        
                    _this.initializeControls();        
                    _this.initialize3dRudder();
                });
                this.SDK.on('error', function (e) {         
                    console.log(e);
                });
                this.SDK.on('statusDevice', function(status, port) {
                    const controller = document.querySelector(`div[data-3drid="${_this.id}"]`);                   
                    const shadowController = controller.shadowRoot.querySelector('#controls3dRudder'); 
                    shadowController.innerHTML = this.getStatusString(status);
                });
            }            
        };
    
        injector.videoController.prototype.remove = function() {
            this.parentElement.removeChild(this);
        }
    
        injector.videoController.prototype.initialize3dRudder = function() {
            // on tick each frame 20ms
            var tick = 20;
            var SDK = this.SDK;
            var player = this.video;
            var active = true;
            document.addEventListener("visibilitychange", function() {
                active = document.visibilityState === "visible";
            });

            setInterval( function() {
                var controller = SDK.controllers[0];
                if (active && controller.connected && settings !== null) {
                    var pp = settings.playpause;
                    var fr = settings.forwardrewind;
                    var v = settings.volume;
                    var axis = controller.axis;
                    if (axis[pp.axis] > pp.threshold) { // PLAY
                        player.play();
                    } else if (axis[pp.axis] < -pp.threshold) { // PAUSE
                        player.pause();
                    } 
                    if (Math.abs(axis[fr.axis]) > fr.threshold) { // FORWARD REWIND
                        var time = player.currentTime;                        
                        time += axis[fr.axis] * fr.speed * (1/tick);
                        time = Math.min(Math.max(0, time), player.duration);
                        if (time < player.duration) {
                            player.currentTime = time;
                        }                        
                    } 
                    if (Math.abs(axis[v.axis]) > v.threshold) { // VOLUME + VOLUME -
                        var volume = player.volume;
                        volume += axis[v.axis] * (1/tick);
                        player.volume = Math.min(Math.max(volume, 0), 1);
                        //console.log("volume" + volume);
                    }               
                }
            }, tick);
        }

        injector.videoController.prototype.initializeControls = function() {
            var document = this.document;
            var top = Math.max(this.video.offsetTop, 0) + "px",
            left = Math.max(this.video.offsetLeft, 0) + "px";

            var wrapper = document.createElement('div');
            wrapper.classList.add('v3dr-controller');
            wrapper.dataset['3drid'] = this.id;  
            
            var shadow = wrapper.createShadowRoot();
            var shadowTemplate = `
            <style>
                @import "${chrome.runtime.getURL('shadow.css')}";
            </style>
            <div id="controller3dRudder" style="top:${top}; left:${left}">
                <div style="display: table;">
                    <svg style="vertical-align: middle;display: table-cell;" width="30" height="30" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="Dashboard-Screens" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <g id="Navigation-(Default-State)" transform="translate(-34.000000, -92.000000)" fill="#43C6AA">
                                <g id="3dRudder-icon-default" transform="translate(33.500000, 92.000000)">
                                    <path d="M15.6579066,0 C7.37390658,0 0.657906579,6.716 0.657906579,15 C0.657906579,23.285 7.37390658,30 15.6579066,30 C23.9429066,30 30.6579066,23.285 30.6579066,15 C30.6579066,6.716 23.9429066,0 15.6579066,0 M15.6579066,1.5 C23.1019066,1.5 29.1579066,7.556 29.1579066,15 C29.1579066,22.444 23.1019066,28.5 15.6579066,28.5 C8.21390658,28.5 2.15790658,22.444 2.15790658,15 C2.15790658,7.556 8.21390658,1.5 15.6579066,1.5" id="Fill-1"></path>
                                    <path d="M12.7513066,27.2968 C12.6003066,27.2498 12.4473066,27.1998 12.2963066,27.1468 C12.1403066,27.0928 11.9823066,27.0348 11.8273066,26.9738 C11.6713066,26.9138 11.5143066,26.8488 11.3593066,26.7818 C11.2053066,26.7158 11.0493066,26.6458 10.8963066,26.5728 C10.7433066,26.5008 10.5903066,26.4248 10.4413066,26.3478 C10.2933066,26.2718 10.1443066,26.1908 9.99630658,26.1078 C9.85130658,26.0268 9.70630658,25.9418 9.56730658,25.8558 C9.42630658,25.7698 9.28730658,25.6818 9.15230658,25.5928 C9.01930658,25.5038 8.88530658,25.4128 8.75630658,25.3198 C8.62930658,25.2288 8.50330658,25.1358 8.38130658,25.0408 C8.26230658,24.9488 8.14330658,24.8538 8.02830658,24.7578 C7.91630658,24.6638 7.80530658,24.5678 7.69830658,24.4708 C5.12130658,22.1438 3.61830658,18.9678 3.46730658,15.5288 C3.31630658,12.0918 4.53330658,8.7998 6.89630658,6.2618 C7.71330658,5.3838 8.64130658,4.6278 9.66430658,4.0058 L11.2033066,7.5948 C11.4513066,8.1738 11.3183066,8.8358 10.8633066,9.2798 C10.7973066,9.3438 10.7343066,9.4088 10.6723066,9.4738 C10.6083066,9.5408 10.5463066,9.6088 10.4843066,9.6788 C10.4233066,9.7478 10.3623066,9.8188 10.3033066,9.8908 C10.2433066,9.9638 10.1853066,10.0378 10.1283066,10.1128 C10.0703066,10.1888 10.0133066,10.2658 9.95830658,10.3428 C9.90230658,10.4208 9.84830658,10.5008 9.79630658,10.5808 C9.74230658,10.6608 9.69030658,10.7428 9.64030658,10.8248 C9.59030658,10.9068 9.54130658,10.9908 9.49330658,11.0748 C9.44630658,11.1588 9.40030658,11.2438 9.35530658,11.3298 C9.31130658,11.4148 9.26830658,11.5008 9.22730658,11.5878 C9.18530658,11.6748 9.14530658,11.7618 9.10730658,11.8498 C9.06930658,11.9358 9.03330658,12.0238 8.99830658,12.1128 C8.96430658,12.1998 8.93130658,12.2888 8.89930658,12.3778 C8.86830658,12.4648 8.83930658,12.5528 8.81130658,12.6418 C8.78330658,12.7308 8.75730658,12.8188 8.73330658,12.9068 C8.70930658,12.9948 8.68730658,13.0828 8.66630658,13.1708 C7.91430658,16.3888 9.27630658,19.7868 12.0553066,21.6258 C12.4913066,21.9138 12.7513066,22.3918 12.7513066,22.9038 L12.7513066,27.2968 Z" id="Fill-3"></path>
                                    <path d="M18.5991066,22.9039 C18.5991066,22.3919 18.8591066,21.9139 19.2951066,21.6259 C22.0741066,19.7869 23.4361066,16.3889 22.6841066,13.1699 C22.6631066,13.0819 22.6411066,12.9939 22.6171066,12.9059 C22.5931066,12.8179 22.5671066,12.7299 22.5391066,12.6419 C22.5111066,12.5539 22.4821066,12.4649 22.4511066,12.3769 C22.4191066,12.2889 22.3861066,12.1999 22.3521066,12.1119 C22.3171066,12.0239 22.2801066,11.9359 22.2421066,11.8489 C22.2041066,11.7609 22.1651066,11.6749 22.1241066,11.5889 C22.0821066,11.4999 22.0391066,11.4139 21.9941066,11.3289 C21.9501066,11.2429 21.9041066,11.1589 21.8571066,11.0749 C21.8091066,10.9899 21.7601066,10.9069 21.7091066,10.8239 C21.6601066,10.7429 21.6081066,10.6609 21.5551066,10.5809 C21.5021066,10.5009 21.4481066,10.4219 21.3921066,10.3429 C21.3371066,10.2659 21.2811066,10.1889 21.2231066,10.1129 C21.1651066,10.0379 21.1071066,9.9639 21.0471066,9.8909 C20.9871066,9.8189 20.9271066,9.7479 20.8651066,9.6779 C20.8041066,9.6089 20.7421066,9.5409 20.6791066,9.4749 C20.6161066,9.4079 20.5521066,9.3439 20.4881066,9.2809 C20.0331066,8.8359 19.8991066,8.1739 20.1471066,7.5949 L21.6861066,4.0059 C22.7091066,4.6279 23.6371066,5.3839 24.4541066,6.2619 C26.8171066,8.7999 28.0341066,12.0909 27.8831066,15.5289 C27.7321066,18.9679 26.2291066,22.1429 23.6511066,24.4709 C23.5451066,24.5669 23.4341066,24.6639 23.3221066,24.7579 C23.2081066,24.8529 23.0891066,24.9489 22.9691066,25.0409 C22.8471066,25.1359 22.7211066,25.2289 22.5941066,25.3199 C22.4651066,25.4119 22.3321066,25.5039 22.1981066,25.5929 C22.0631066,25.6819 21.9241066,25.7709 21.7841066,25.8559 C21.6441066,25.9419 21.4991066,26.0259 21.3531066,26.1089 C21.2071066,26.1909 21.0571066,26.2719 20.9091066,26.3479 C20.7601066,26.4249 20.6071066,26.5009 20.4541066,26.5729 C20.3011066,26.6459 20.1451066,26.7159 19.9921066,26.7819 C19.8361066,26.8489 19.6791066,26.9139 19.5241066,26.9739 C19.3681066,27.0339 19.2101066,27.0929 19.0541066,27.1469 C18.9041066,27.1989 18.7511066,27.2499 18.5991066,27.2969 L18.5991066,22.9039 Z" id="Fill-5"></path>
                                    <path d="M15.6579066,9.8926 C12.8369066,9.8926 10.5499066,12.1796 10.5499066,14.9996 C10.5499066,17.8216 12.8369066,20.1076 15.6579066,20.1076 C18.4789066,20.1076 20.7659066,17.8216 20.7659066,14.9996 C20.7659066,12.1796 18.4789066,9.8926 15.6579066,9.8926 M15.6579066,10.8926 C17.9229066,10.8926 19.7659066,12.7356 19.7659066,14.9996 C19.7659066,17.2656 17.9229066,19.1076 15.6579066,19.1076 C13.3929066,19.1076 11.5499066,17.2656 11.5499066,14.9996 C11.5499066,12.7356 13.3929066,10.8926 15.6579066,10.8926" id="Fill-7"></path>
                                    <path d="M17.5192066,15.7528 C17.5192066,15.8848 17.4492066,16.0068 17.3352066,16.0728 L15.9412066,16.8808 C15.8712066,16.9218 15.7912066,16.9368 15.7132066,16.9278 L15.7132066,12.9618 C15.7912066,12.9528 15.8712066,12.9678 15.9412066,13.0088 L17.3352066,13.8168 C17.4492066,13.8828 17.5192066,14.0048 17.5192066,14.1368 L17.5192066,15.7528 Z M17.8982066,13.3988 L15.9192066,12.2508 C15.7572066,12.1578 15.5582066,12.1578 15.3972066,12.2508 L13.4172066,13.3988 C13.2562066,13.4928 13.1562066,13.6658 13.1562066,13.8528 L13.1562066,16.1478 C13.1562066,16.3348 13.2562066,16.5078 13.4172066,16.6018 L15.3972066,17.7498 C15.5582066,17.8428 15.7572066,17.8428 15.9192066,17.7498 L17.8982066,16.6018 C18.0602066,16.5078 18.1592066,16.3348 18.1592066,16.1478 L18.1592066,13.8528 C18.1592066,13.6658 18.0602066,13.4928 17.8982066,13.3988 L17.8982066,13.3988 Z" id="Fill-9"></path>
                                </g>
                            </g>
                        </g>
                    </svg>                
                    <span id="controls3dRudder">status: NoStatus</span>
                </div>
            </div>
            `;
            shadow.innerHTML = shadowTemplate;         

            this.speedIndicator = shadow.querySelector('span');
            var fragment = document.createDocumentFragment();
            fragment.appendChild(wrapper);

            this.video.classList.add('3dr-initialized');
            this.video.dataset['3drid'] = this.id;
            switch (true) {
                case (location.hostname == 'www.amazon.com'):
                case (/hbogo\./).test(location.hostname):
                  // insert before parent to bypass overlay
                  this.parent.parentElement.insertBefore(fragment, this.parent);
                  break;
        
                default:
                  // Note: when triggered via a MutationRecord, it's possible that the
                  // target is not the immediate parent. This appends the controller as
                  // the first element of the target, which may not be the parent.
                  this.parent.insertBefore(fragment, this.parent.firstChild);
              }
        }
      }
    // init when all DOM ready
    function initializeWhenReady(document) {
        // black list 
        /*var blacklisted = false;
        tc.settings.blacklist.split("\n").forEach(match => {
        match = match.replace(/^\s+|\s+$/g,'')
        if (match.length == 0) {
            return;
        }

        var regexp = new RegExp(escapeStringRegExp(match));
        if (regexp.test(location.href)) {
            blacklisted = true;
            return;
        }
        })

        if (blacklisted)
        return;*/
        window.onload = () => { initializeNow(window.document) };
        if (document && document.doctype && document.doctype.name == "html") {
            if (document.readyState === "complete") {
                initializeNow(document);
            } else {
                document.onreadystatechange = () => {
                    if (document.readyState === "complete") {
                        initializeNow(document);
                    }
                }
            }
        }
    }

    // init with currend DOM
    function initializeNow(document) {
        if (document.body.classList.contains('3dr-initialized')) {
            return;
        }
        document.body.classList.add('3dr-initialized');

        if (document === window.document) {
            defineVideoController();
        } else {
            var link = document.createElement('link');
            link.href = chrome.runtime.getURL('inject.css');
            link.type = 'text/css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        function checkForVideo(node, parent, added) {
            if (node.nodeName === 'VIDEO') {
                if (added) {
                    new injector.videoController(node, parent);
                } else {
                    if (node.classList.contains('3dr-initialized')) {
                        let id = node.dataset['3drid'];
                        let ctrl = document.querySelector(`div[data-3drid="${id}"]`);
                        if (ctrl) {
                            ctrl.remove();
                        }
                        node.classList.remove('3dr-initialized');
                        delete node.dataset['3drid'];
                    }
                }
            } else if (node.children != undefined) {
                for (var i = 0; i < node.children.length; i++) {
                    checkForVideo(node.children[i], node.children[i].parentNode || parent, added);
                }
            }
        }
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                forEach.call(mutation.addedNodes, function(node) {
                    if (typeof node === "function")
                        return;
                    checkForVideo(node, node.parentNode || mutation.target, true);
                })
                forEach.call(mutation.removedNodes, function(node) {
                    if (typeof node === "function")
                        return;
                    checkForVideo(node, node.parentNode || mutation.target, false);
                })
            });
        });
        observer.observe(document, { childList: true, subtree: true });

        var videoTags = document.getElementsByTagName('video');
        forEach.call(videoTags, function(video) {
            new injector.videoController(video);
        });

        var frameTags = document.getElementsByTagName('iframe');
        forEach.call(frameTags, function(frame) {
            // Ignore frames we don't have permission to access (different origin).
            try { var childDocument = frame.contentDocument } catch (e) { return }
            initializeWhenReady(childDocument);
        });
    }
});