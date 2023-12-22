import { subscription } from './subscription';
import { isDefined, isUndefined, isNullorUndef, isFunction, isString, isArray } from '../utils/utils';

export const handleSubscriptions = (subs, appId, isLocalSubs=false, appTap) => {
console.log(subs, appId, isLocalSubs)
  /* START.DEV_ONLY */
  const subsStatus = [];
  /* END.DEV_ONLY */

  for (let i = 0; i < subs.length; i++) {

    const sub = subs[i];
    let action = isArray(sub.action) ? sub.action[0] : sub.action;
    const cache = subscription.getCache();
    console.log('CACHE ', JSON.parse(JSON.stringify(cache)))

    console.log(sub)

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
    sub.typeLocal = isLocalSubs;
  
    /* START.DEV_ONLY */
    if (isNullorUndef(subKey)) {
      console.warn('Please add an explicit id ({id: "identifierName"}) to subscription obj due to action.name not being supported by this browser');
    }
    /* END.DEV_ONLY */



    if (!sub.name) {

      if (!cache[sub.key]) {

        cache[sub.key] = {
          name: false,
          when: sub.when,
          fun: action,
          typeLocal: isLocalSubs
        };
      }

      if (sub.when) {
        // this subscription action is called whenever the state changes
        cache[sub.key].unmount = cache[sub.key].fun();
      }
    }
    // function denoted user or custom sub
    else if (isFunction(sub.name)) {

      // sub.name({
      //   opts: sub.options,
      //   action: action,
      //   actionArgs: isArray(sub.action) ? sub.action.slice(1) : [],
      //   condition: isNullorUndef(sub.when) ? true : sub.when,
      //   subKey,
      //   subCache: subscription.getCache()
      // });

      // if (!cache[sub.key]) {
      //   console.log('no cache')
      //   cache[sub.key] = {
      //     typeLocal: isLocalSubs
      //   };

      //   if (sub.when) {
      //     console.log('when')
      //     cache[sub.key].unmount = action();
      //   } 
      // }
      // else {
      //   if (!sub.when) {

      //     if (isFunction(sub.unmount)) {
      //       sub.unmount();
      //     }
      //     delete subCache[sub.key];
      //   } 
      // }

      if (sub.when) {
        console.log('sub.when', sub.key, cache, !cache[sub.key])
        if (isUndefined(cache[sub.key])) {

          subscription.setCache(sub.key, {
            typeLocal: isLocalSubs,
            unmount: sub.name(action, sub.options)
          })
          // cache[sub.key] = {
          //   typeLocal: isLocalSubs,
          //   unmount: sub.name(action, sub.options)
          // };

          console.log('cahced ', cache)
          console.log('subscription.getCache() ', subscription.getCache())
        }
      }
      else {
        console.log('not when')
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
            isArray(sub.action) ? sub.action.slice(1) : undefined,
            sub.typeLocal
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

  const activeSubKey = subs.map(sub => sub.key);
  const subCache = subscription.getCache();

  // console.log('subCache ', subCache)

  // console.log('activeSubKey ', activeSubKey)


  Object.keys(subCache).forEach(subKey => {

    const sub = subCache[subKey];

    if (sub.typeLocal && activeSubKey.indexOf(subKey) === -1) {
        
      if (!sub.name) {
        if (isFunction(sub.unmount)) {
          sub.unmount();
        }
        delete subCache[subKey];
      }
      else if (isFunction(sub.name)) {
        // sub.name({
        //   opts: sub.options,
        //   action: action,
        //   actionArgs: isArray(sub.action) ? sub.action.slice(1) : [],
        //   condition: isNullorUndef(sub.when) ? true : sub.when,
        //   subKey,
        //   subCache: subscription.getCache()
        // });
      } 
      else if (isString(sub.name)) { 
        subscription.removeEvent(
          sub.el || window,
          sub.name,
          subKey
        );
      }    
    }
  });

  /* START.DEV_ONLY */
  if (isDefined(appTap[appId].subscriptions)) {
    appTap[appId].subscriptions({ subs: subsStatus });
  }
  /* END.DEV_ONLY */
}