import { subscription } from './subscription';
import { isDefined, isUndefined, isNullorUndef, isFunction, isString, isArray } from '../utils/utils';

export const handleSubscriptions = (subs, appId, appTap) => {

  /* START.DEV_ONLY */
  const subsStatus = [];
  /* END.DEV_ONLY */

  for (let i = 0; i < subs.length; i++) {

    const sub = subs[i];
    let action = isArray(sub.action) ? sub.action[0] : sub.action;
    const cache = subscription.getCache();

    if (sub.action && isUndefined(action.name)) {
      Object.defineProperty(action.prototype, 'name', {
        get: function () {
          return /function ([^(]*)/.exec(this + '')[1];
        }
      });
    }

    action = isArray(sub.action) ? (arg) => sub.action[0](...sub.action.slice(1), arg) : sub.action;
    const subKey = (sub.key || '') +  action.name + '_' + (sub.name || 'sub-key').toString().replace(/\s/g, '');
    sub.key = subKey;
  
    /* START.DEV_ONLY */
    if (isNullorUndef(subKey)) {
      console.warn('Please add an explicit id ({id: "identifierName"}) to subscription obj due to action.name not being supported by this browser');
    }
    /* END.DEV_ONLY */

    if (!sub.name) {

      // this subscription action is called whenever the state changes
      if (isUndefined(sub.when) && isUndefined(sub.watch)) { 
        action();
      }
       // this subscription action is called once whenever the state changes and the 'when' condition is met
      else if (sub.when || !!sub.watch) {
        if (sub.when || (isUndefined(sub.when) && !sub.watch) || (!!sub.watch && !cache[sub.key])) {
          cache[sub.key] = {
            when: sub.when,
            watch: sub.watch,
            unmount: null
          }
          action();
        }
      } 
      // this subscription action is called once whenever the state changes and the 'when' condition is not met
      else { 
        if (cache[sub.key]) {
          if (sub.when === false) {
            delete cache[sub.key];
          }
          else if (sub.watch && sub.watch !== cache[sub.key].watch) {
            cache[sub.key].watch = sub.watch;
            action();
          }
        }
      }
    }
    // function denoted user or custom sub
    else if (isFunction(sub.name)) {

      if (sub.when || (isUndefined(sub.when) && !sub.watch) || (!!sub.watch && !cache[sub.key])) {

        if (isUndefined(cache[sub.key])) {
          subscription.setCache(sub.key, {
            when: sub.when,
            watch: sub.watch,
            unmount: sub.name(action, sub.options)
          })
        }
      }
      else {

        const cachedSub = cache[sub.key];
        if (cachedSub) {
          if (sub.when === false) {
            if (isFunction(cachedSub.unmount)) {
              cachedSub.unmount();
            }
            delete cache[sub.key];
          }
          else if (sub.watch && sub.watch !== cachedSub.watch) {
            if (isFunction(cachedSub.unmount)) {
              cachedSub.unmount();
            }
            cachedSub.watch = sub.watch;
            sub.name(action, sub.options)
          }
        }
      }

      /* START.DEV_ONLY */
      if (isDefined(appTap[appId].subscriptions)) {
        subsStatus.push({ name: sub.name.name, active: isNullorUndef(sub.when) ? true : sub.when, action: action.name });
      }
      /* END.DEV_ONLY */
    } 
    // string denotes event sub
    else if (isString(sub.name)) { 

      if (sub.when || isUndefined(sub.when)) {

        if (isUndefined(cache[sub.key])) {

          subscription.addEvent(
            sub.el || window,
            sub.name,
            subKey,
            action,
            isArray(sub.action) ? sub.action.slice(1) : undefined
          );

          /* START.DEV_ONLY */
          if (isDefined(appTap[appId].subscriptions)) {
            subsStatus.push({ name: sub.name, active: true, action: action.name });
          }
          /* END.DEV_ONLY */
        }
      }

      else if (cache[sub.key]) {

        subscription.removeEvent(
          sub.el || window,
          sub.name,
          subKey
        );

        /* START.DEV_ONLY */
        if (isDefined(appTap[appId].subscriptions)) {
          subsStatus.push({ name: sub.name, active: false, action: action.name });
        }
        /* END.DEV_ONLY */
      }
    }
  }

  /* START.DEV_ONLY */
  if (isDefined(appTap[appId].subscriptions)) {
    appTap[appId].subscriptions({ subs: subsStatus });
  }
  /* END.DEV_ONLY */
}