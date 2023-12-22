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

    if (isUndefined(action.name)) {
      Object.defineProperty(action.prototype, 'name', {
        get: function () {
          return /function ([^(]*)/.exec(this + '')[1];
        }
      });
    }

    action = isArray(sub.action) ? () => sub.action[0](...sub.action.slice(1)) : sub.action;
    const subKey = sub.key || action.name + '_' + (sub.name || 'sub-key').toString().replace(/\s/g, '');
    sub.key = subKey;
  
    /* START.DEV_ONLY */
    if (isNullorUndef(subKey)) {
      console.warn('Please add an explicit id ({id: "identifierName"}) to subscription obj due to action.name not being supported by this browser');
    }
    /* END.DEV_ONLY */

    if (!sub.name) {

      if (sub.when) {
        // this subscription action is called whenever the state changes
        if (!cache[sub.key]) {
          cache[sub.key] = true;
          action();
        }
      } 
      else {
        if (cache[sub.key]) {
          delete cache[sub.key];
        }
      }
    }
    // function denoted user or custom sub
    else if (isFunction(sub.name)) {

      if (sub.when || isUndefined(sub.when)) {
        if (isUndefined(cache[sub.key])) {
          subscription.setCache(sub.key, {
            unmount: sub.name(action, sub.options)
          })
        }
      }
      else {
        const cachedSub = cache[sub.key];
        if (cachedSub) {
          if (isFunction(cachedSub.unmount)) {
            cachedSub.unmount();
          }
          delete cache[sub.key];
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

        if (!isDefined(subscription.getCache()[subKey])) {

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

      else if (isDefined(subscription.getCache()[subKey])) {

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