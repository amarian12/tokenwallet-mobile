export class AppConstants {
    public static KEY_CURRENT_WALLET = 'currentWallet';
    public static KEY_AVAILABLE_WALLETS = 'availableWallets';
    public static KEY_SETUP_COMPLETED = 'setupComplete';
    public static KEY_CREATE_WALLET_RUNNING = 'createWalletRunning';
    public static KEY_WALLET_LOCATION = 'walletLocation';
    public static KEY_BACKUP_LOCATION = 'backupLocation';
    public static KEY_WALLET_MNEMONIC_RECOVERY = 'mnemonicRecovery';
    public static KEY_WALLET_MNEMONIC_HASH = 'mnemonicHash';
    public static KEY_WALLET_MNEMONIC_WORDS = 'mnemonicWords';
    public static KEY_WALLET_ENCRYPTED_PIN = 'encPINcode';
    public static KEY_WALLET_PASSWORD_HASH = 'walletPasswordHash';
    public static KEY_WALLET_EMAIL = 'walletEmailAddress';
    public static KEY_PRODUCTION_NETWORK = 'productionNetwork';
    public static KEY_LAST_WALLET_SERVER = 'lastWalletServer';
    public static KEY_COININFO = 'cscCoinInfo';
    public static KEY_DEFAULT_ACCOUNT_ID = 'defaultAccountID';
    public static KEY_BRM_USER = 'brmUSER';
    public static KEY_BRM_PIN = 'brmPIN';
    public static KEY_BRM_OPERATORS = 'brmOPERATORS';
    public static KEY_INIT = 'INIT';
    public static KEY_LOADED = 'LOADED';
    public static KEY_OPENING = 'OPENING';
    public static KEY_CLOSED = 'CLOSED';
    public static KEY_FINISHED = 'FINISHED';
    public static KEY_ERRORED = 'ERRORED';
    public static KEY_CONNECTED = 'CONNECTED';
    public static KEY_DISCONNECTED = 'DISCONNECTED';
    public static KEY_WALLET_PASSWORD = 'walletPassword';
    public static KEY_WALLET_TX_IN = 'incommingTX';
    public static KEY_WALLET_TX_OUT = 'outgoingTX';
    public static KEY_WALLET_TX_BOTH = 'walletInternalTX';
    public static KEY_LAST_UPDATED_COININFO = 'lastUpdatedCoininfo';
    public static KEY_TX_STATUS_NEW = 'txNEW';
    public static KEY_TX_STATUS_SEND = 'txSEND';
    public static KEY_TX_STATUS_ERROR = 'txERROR';
    public static KEY_TX_STATUS_RECEIVED = 'txRECEIVED';
    public static KEY_TX_STATUS_VALIDATED = 'txVALIDATED';
    public static tfFullyCanonicalSig = 2147483648;
    public static DISLAIMER_TEXT = 'Basic Wallet Terms and Conditions\r\n\r\nThese terms and conditions form an agreement between you and the CasinoCoin Foundation ("CSC") when you download the basic wallet software to use the CasinoCoin services ("CSC Software"). You may download, install and use the CSC Software only in accordance with the terms and conditions of the CasinoCoin website.\r\n\r\nEligibility and Acceptance\r\n\r\nTo be eligible to download the CSC Software you must be at least 18 years old or the age of majority in the jurisdiction in which you reside. Your use of the CSC Software is your confirmation that you meet all eligibility requirements for the CSC Software and your acceptance of these terms and conditions.\r\n\r\nDisclaimer of Warranties\r\n\r\nTHE CSC SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE CSC BE LIABLE FOR ANY CLAIM, LOSS, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING IN ANY WAY OUT OF THE CSC SOFTWARE, YOUR USE OF THE CSC SOFTWARE, OR THE ACTS OR OMISSIONS OF CSC.\r\n\r\nLimitation of Liability\r\n\r\nCSC shall not be liable or responsible for any use or misuse of the CSC Software, or any loss whatsoever attributed to the CSC Software. The CSC Software may be unavailable from time to time due to interruptions in services provided by third party providers or due to technical interruptions or maintenance requirements, and CSC is not liable for any loss which you may suffer as a result of such interruptions.\r\n\r\nLast Update: November 24, 2017';
    public static NOT_CONNECTED_ON_SEND_TEXT = 'To send coins you must be connected to the network';
    public static KEY_JWT = 'JSONWebToken';
    public static JUMIO_RESULT = 'jumioResult';
    public static LOGGED_IN = 'loggedIn';
    public static KEY_WALLET_SETTINGS = 'walletSettings';
    public static KEY_WALLET_FAIO_ENABLED = 'settingsFaioEnabled';
    public static SLIDE_COVER_EFFECT = {
            slidesPerView: 3,
            coverflowEffect: {
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            },
            on: {
              beforeInit() {
                const swiper = this;

                swiper.classNames.push(`${swiper.params.containerModifierClass}coverflow`);
                swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);

                swiper.params.watchSlidesProgress = true;
                swiper.originalParams.watchSlidesProgress = true;
              },
              setTranslate() {
                const swiper = this;
                const {
                  width: swiperWidth, height: swiperHeight, slides, $wrapperEl, slidesSizesGrid, $
                } = swiper;
                const params = swiper.params.coverflowEffect;
                const isHorizontal = swiper.isHorizontal();
                const transform$$1 = swiper.translate;
                const center = isHorizontal ? -transform$$1 + (swiperWidth / 2) : -transform$$1 + (swiperHeight / 2);
                const rotate = isHorizontal ? params.rotate : -params.rotate;
                const translate = params.depth;
                // Each slide offset from center
                for (let i = 0, length = slides.length; i < length; i += 1) {
                  const $slideEl = slides.eq(i);
                  const slideSize = slidesSizesGrid[i];
                  const slideOffset = $slideEl[0].swiperSlideOffset;
                  const offsetMultiplier = ((center - slideOffset - (slideSize / 2)) / slideSize) * params.modifier;

                   let rotateY = isHorizontal ? rotate * offsetMultiplier : 0;
                  let rotateX = isHorizontal ? 0 : rotate * offsetMultiplier;
                  // var rotateZ = 0
                  let translateZ = -translate * Math.abs(offsetMultiplier);

                   let translateY = isHorizontal ? 0 : params.stretch * (offsetMultiplier);
                  let translateX = isHorizontal ? params.stretch * (offsetMultiplier) : 0;

                   // Fix for ultra small values
                  if (Math.abs(translateX) < 0.001) translateX = 0;
                  if (Math.abs(translateY) < 0.001) translateY = 0;
                  if (Math.abs(translateZ) < 0.001) translateZ = 0;
                  if (Math.abs(rotateY) < 0.001) rotateY = 0;
                  if (Math.abs(rotateX) < 0.001) rotateX = 0;

                   const slideTransform = `translate3d(${translateX}px,${translateY}px,${translateZ}px)  rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

                   $slideEl.transform(slideTransform);
                  $slideEl[0].style.zIndex = -Math.abs(Math.round(offsetMultiplier)) + 1;
                  if (params.slideShadows) {
                    // Set shadows
                    let $shadowBeforeEl = isHorizontal ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
                    let $shadowAfterEl = isHorizontal ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
                    if ($shadowBeforeEl.length === 0) {
                      $shadowBeforeEl = swiper.$(`<div class="swiper-slide-shadow-${isHorizontal ? 'left' : 'top'}"></div>`);
                      $slideEl.append($shadowBeforeEl);
                    }
                    if ($shadowAfterEl.length === 0) {
                      $shadowAfterEl = swiper.$(`<div class="swiper-slide-shadow-${isHorizontal ? 'right' : 'bottom'}"></div>`);
                      $slideEl.append($shadowAfterEl);
                    }
                    if ($shadowBeforeEl.length) $shadowBeforeEl[0].style.opacity = offsetMultiplier > 0 ? offsetMultiplier : 0;
                    if ($shadowAfterEl.length) $shadowAfterEl[0].style.opacity = (-offsetMultiplier) > 0 ? -offsetMultiplier : 0;
                  }
                }

                 // Set correct perspective for IE10
                if (swiper.support.pointerEvents || swiper.support.prefixedPointerEvents) {
                  const ws = $wrapperEl[0].style;
                  ws.perspectiveOrigin = `${center}px 50%`;
                }
              },
              setTransition(duration) {
                const swiper = this;
                swiper.slides
                  .transition(duration)
                  .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
                  .transition(duration);
              }
            }
          };
    public static SLIDE_FLIP_EFFECT = {
        on: {
            beforeInit() {
              const swiper = this;
              swiper.classNames.push(`${swiper.params.containerModifierClass}flip`);
              swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
              const overwriteParams = {
                slidesPerView: 1,
                slidesPerColumn: 1,
                slidesPerGroup: 1,
                watchSlidesProgress: true,
                spaceBetween: 0,
                virtualTranslate: true,
              };
              swiper.params = Object.assign(swiper.params, overwriteParams);
              swiper.originalParams = Object.assign(swiper.originalParams, overwriteParams);
            },
            setTranslate() {
              const swiper = this;
              const { $, slides, rtlTranslate: rtl } = swiper;
              for (let i = 0; i < slides.length; i += 1) {
                const $slideEl = slides.eq(i);
                let progress = $slideEl[0].progress;
                if (swiper.params.flipEffect.limitRotation) {
                  progress = Math.max(Math.min($slideEl[0].progress, 1), -1);
                }
                const offset$$1 = $slideEl[0].swiperSlideOffset;
                const rotate = -180 * progress;
                let rotateY = rotate;
                let rotateX = 0;
                let tx = -offset$$1;
                let ty = 0;
                if (!swiper.isHorizontal()) {
                  ty = tx;
                  tx = 0;
                  rotateX = -rotateY;
                  rotateY = 0;
                } else if (rtl) {
                  rotateY = -rotateY;
                }

                 $slideEl[0].style.zIndex = -Math.abs(Math.round(progress)) + slides.length;

                 if (swiper.params.flipEffect.slideShadows) {
                  // Set shadows
                  let shadowBefore = swiper.isHorizontal() ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
                  let shadowAfter = swiper.isHorizontal() ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
                  if (shadowBefore.length === 0) {
                    shadowBefore = swiper.$(`<div class="swiper-slide-shadow-${swiper.isHorizontal() ? 'left' : 'top'}"></div>`);
                    $slideEl.append(shadowBefore);
                  }
                  if (shadowAfter.length === 0) {
                    shadowAfter = swiper.$(`<div class="swiper-slide-shadow-${swiper.isHorizontal() ? 'right' : 'bottom'}"></div>`);
                    $slideEl.append(shadowAfter);
                  }
                  if (shadowBefore.length) shadowBefore[0].style.opacity = Math.max(-progress, 0);
                  if (shadowAfter.length) shadowAfter[0].style.opacity = Math.max(progress, 0);
                }
                $slideEl
                  .transform(`translate3d(${tx}px, ${ty}px, 0px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
              }
            },
            setTransition(duration) {
              const swiper = this;
              const { slides, activeIndex, $wrapperEl } = swiper;
              slides
                .transition(duration)
                .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
                .transition(duration);
              if (swiper.params.virtualTranslate && duration !== 0) {
                let eventTriggered = false;
                // eslint-disable-next-line
                slides.eq(activeIndex).transitionEnd(function onTransitionEnd() {
                  if (eventTriggered) return;
                  if (!swiper || swiper.destroyed) return;

                  eventTriggered = true;
                  swiper.animating = false;
                  const triggerEvents = ['webkitTransitionEnd', 'transitionend'];
                  for (let i = 0; i < triggerEvents.length; i += 1) {
                    $wrapperEl.trigger(triggerEvents[i]);
                  }
                });
              }
            }
        }
    };
    public static SLIDE_CUBE_EFFECT =  {
          grabCursor: true,
          cubeEffect: {
            shadow: true,
            slideShadows: true,
            shadowOffset: 20,
            shadowScale: 0.94,
          },
          on: {
            beforeInit: function() {
              const swiper = this;
              swiper.classNames.push(`${swiper.params.containerModifierClass}cube`);
              swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);

              const overwriteParams = {
                slidesPerView: 1,
                slidesPerColumn: 1,
                slidesPerGroup: 1,
                watchSlidesProgress: true,
                resistanceRatio: 0,
                spaceBetween: 0,
                centeredSlides: false,
                virtualTranslate: true,
              };

              this.params = Object.assign(this.params, overwriteParams);
              this.originalParams = Object.assign(this.originalParams, overwriteParams);
            },
            setTranslate: function() {
              const swiper = this;
              const {
                $el, $wrapperEl, slides, width: swiperWidth, height: swiperHeight, rtlTranslate: rtl, size: swiperSize,
              } = swiper;
              const params = swiper.params.cubeEffect;
              const isHorizontal = swiper.isHorizontal();
              const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
              let wrapperRotate = 0;
              let $cubeShadowEl;
              if (params.shadow) {
                if (isHorizontal) {
                  $cubeShadowEl = $wrapperEl.find('.swiper-cube-shadow');
                  if ($cubeShadowEl.length === 0) {
                    $cubeShadowEl = swiper.$('<div class="swiper-cube-shadow"></div>');
                    $wrapperEl.append($cubeShadowEl);
                  }
                  $cubeShadowEl.css({ height: `${swiperWidth}px` });
                } else {
                  $cubeShadowEl = $el.find('.swiper-cube-shadow');
                  if ($cubeShadowEl.length === 0) {
                    $cubeShadowEl = swiper.$('<div class="swiper-cube-shadow"></div>');
                    $el.append($cubeShadowEl);
                  }
                }
              }

              for (let i = 0; i < slides.length; i += 1) {
                const $slideEl = slides.eq(i);
                let slideIndex = i;
                if (isVirtual) {
                  slideIndex = parseInt($slideEl.attr('data-swiper-slide-index'), 10);
                }
                let slideAngle = slideIndex * 90;
                let round = Math.floor(slideAngle / 360);
                if (rtl) {
                  slideAngle = -slideAngle;
                  round = Math.floor(-slideAngle / 360);
                }
                const progress = Math.max(Math.min($slideEl[0].progress, 1), -1);
                let tx = 0;
                let ty = 0;
                let tz = 0;
                if (slideIndex % 4 === 0) {
                  tx = -round * 4 * swiperSize;
                  tz = 0;
                } else if ((slideIndex - 1) % 4 === 0) {
                  tx = 0;
                  tz = -round * 4 * swiperSize;
                } else if ((slideIndex - 2) % 4 === 0) {
                  tx = swiperSize + (round * 4 * swiperSize);
                  tz = swiperSize;
                } else if ((slideIndex - 3) % 4 === 0) {
                  tx = -swiperSize;
                  tz = (3 * swiperSize) + (swiperSize * 4 * round);
                }
                if (rtl) {
                  tx = -tx;
                }

                 if (!isHorizontal) {
                  ty = tx;
                  tx = 0;
                }

                 const transform$$1 = `rotateX(${isHorizontal ? 0 : -slideAngle}deg) rotateY(${isHorizontal ? slideAngle : 0}deg) translate3d(${tx}px, ${ty}px, ${tz}px)`;
                if (progress <= 1 && progress > -1) {
                  wrapperRotate = (slideIndex * 90) + (progress * 90);
                  if (rtl) wrapperRotate = (-slideIndex * 90) - (progress * 90);
                }
                $slideEl.transform(transform$$1);
                if (params.slideShadows) {
                  // Set shadows
                  let shadowBefore = isHorizontal ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
                  let shadowAfter = isHorizontal ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
                  if (shadowBefore.length === 0) {
                    shadowBefore = swiper.$(`<div class="swiper-slide-shadow-${isHorizontal ? 'left' : 'top'}"></div>`);
                    $slideEl.append(shadowBefore);
                  }
                  if (shadowAfter.length === 0) {
                    shadowAfter = swiper.$(`<div class="swiper-slide-shadow-${isHorizontal ? 'right' : 'bottom'}"></div>`);
                    $slideEl.append(shadowAfter);
                  }
                  if (shadowBefore.length) shadowBefore[0].style.opacity = Math.max(-progress, 0);
                  if (shadowAfter.length) shadowAfter[0].style.opacity = Math.max(progress, 0);
                }
              }
              $wrapperEl.css({
                '-webkit-transform-origin': `50% 50% -${swiperSize / 2}px`,
                '-moz-transform-origin': `50% 50% -${swiperSize / 2}px`,
                '-ms-transform-origin': `50% 50% -${swiperSize / 2}px`,
                'transform-origin': `50% 50% -${swiperSize / 2}px`,
              });

               if (params.shadow) {
                if (isHorizontal) {
                  $cubeShadowEl.transform(`translate3d(0px, ${(swiperWidth / 2) + params.shadowOffset}px, ${-swiperWidth / 2}px) rotateX(90deg) rotateZ(0deg) scale(${params.shadowScale})`);
                } else {
                  const shadowAngle = Math.abs(wrapperRotate) - (Math.floor(Math.abs(wrapperRotate) / 90) * 90);
                  const multiplier = 1.5 - (
                    (Math.sin((shadowAngle * 2 * Math.PI) / 360) / 2)
                    + (Math.cos((shadowAngle * 2 * Math.PI) / 360) / 2)
                  );
                  const scale1 = params.shadowScale;
                  const scale2 = params.shadowScale / multiplier;
                  const offset$$1 = params.shadowOffset;
                  $cubeShadowEl.transform(`scale3d(${scale1}, 1, ${scale2}) translate3d(0px, ${(swiperHeight / 2) + offset$$1}px, ${-swiperHeight / 2 / scale2}px) rotateX(-90deg)`);
                }
              }

              const zFactor = (swiper.browser.isSafari || swiper.browser.isUiWebView) ? (-swiperSize / 2) : 0;
              $wrapperEl
                .transform(`translate3d(0px,0,${zFactor}px) rotateX(${swiper.isHorizontal() ? 0 : wrapperRotate}deg) rotateY(${swiper.isHorizontal() ? -wrapperRotate : 0}deg)`);
            },
            setTransition: function(duration) {
              const swiper = this;
              const { $el, slides } = swiper;
              slides
                .transition(duration)
                .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
                .transition(duration);
              if (swiper.params.cubeEffect.shadow && !swiper.isHorizontal()) {
                $el.find('.swiper-cube-shadow').transition(duration);
              }
            },
          }
        };
}
