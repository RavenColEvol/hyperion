/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 *
 * This file is auto generated from the Hyperion project hosted on
 * https://github.com/facebookincubator/hyperion
 * Instead of changing this file, you should:
 * - git clone https://github.com/facebookincubator/hyperion
 * - npm install
 * - npm run install-packages
 * - <make necessary modifications>
 * - npm run build
 * - <copy the 'hyperion/dist/hyperion.js' file
 *
 * @generated SignedSource<<b6b55e695dd5ff53624fac30282355d1>>
 */

    

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
const EmptyCallback = () => { };
class Hook {
    _callbacks;
    call = EmptyCallback;
    hasCallback(cb) {
        if (!this._callbacks) {
            return cb ? this.call === cb : this.call !== EmptyCallback;
        }
        else {
            const callbacks = this._callbacks;
            return (callbacks.length > 0 &&
                (!cb ||
                    callbacks.some(func => func === cb || func._original === cb)));
        }
    }
    createMultiCallbackCall(callbacks) {
        const call = function () {
            const currentCallbacks = callbacks; // We could also use this._callbacks
            for (const cb of currentCallbacks) {
                cb.apply(this, arguments);
            }
        };
        return call;
    }
    add(cb, once) {
        let callback = cb;
        if (once) {
            const that = this;
            const tmp = function () {
                that.remove(tmp);
                return cb.apply(this, arguments);
            };
            tmp._original = cb;
            callback = tmp;
        }
        if (this.call === EmptyCallback) {
            this.call = callback;
        }
        else if (!this._callbacks) {
            this._callbacks = [this.call, callback];
            this.call = this.createMultiCallbackCall(this._callbacks);
        }
        else {
            this._callbacks.push(callback);
        }
        return cb;
    }
    remove(cb) {
        return this.removeIf(f => f === cb);
    }
    removeIf(condition) {
        /**
         * Two cases to consider:
         * - remove may be called while a .call is going on, we should make sure
         *   changing the _callbacks list while running them will not break the
         *   ongoing .call, otherwise the index gets messed up.
         * - a listener may have been added multiple times (although a bad practice)
         * So, we make a new copy of the _callbacks list
         * Since remove is called less often, it is ok to make this function more
         * expensive than .call (e.g. detecting when a .call is running)
         */
        if (this._callbacks) {
            const previousList = this._callbacks;
            this._callbacks = previousList.filter(l => !condition(l));
            // Alternatively we can find the index of cb and just replace it with EmptyCallback
            return previousList.length > this._callbacks.length;
        }
        else if (condition(this.call)) {
            this.call = EmptyCallback;
            return true;
        }
        else {
            return false;
        }
    }
    clear() {
        if (this.call === EmptyCallback || !this._callbacks) {
            this.call = EmptyCallback;
        }
        else {
            this._callbacks.length = 0;
        }
    }
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
if (typeof global === "object"
    && typeof __DEV__ !== "boolean") {
    if (global?.process?.env?.JEST_WORKER_ID ||
        global?.process?.env?.NODE_ENV === 'development') {
        global["__DEV__"] = true;
    }
}
const globalScope = typeof globalThis === "object" ? globalThis :
    typeof global === "object" ? global :
        typeof window === "object" ? window :
            typeof self === "object" ? self :
                {};

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
const devOptions = {
    getCallStack: () => [],
    logger: console,
};
function assert(condition, message, options) {
    if (!condition) {
        const callStackGetter = options?.getCallStack ?? devOptions.getCallStack;
        const logger = options?.logger ?? devOptions.logger;
        const callStack = callStackGetter(2);
        if (callStack && callStack.length > 0) {
            logger.error(message, callStack);
        }
        else {
            logger.error(message);
        }
    }
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
class PropertyInterceptor {
    name;
    status = 0 /* Unknown */;
    constructor(name) {
        this.name = name;
        __DEV__ && assert(!!this.name, "Interceptor name should have value");
    }
    interceptObjectOwnProperties(_obj) {
        __DEV__ && assert(false, `This method must be overriden`);
    }
}
/**
  * Searches the object or its prototype chain for a given property name
  * and the actual object that has the property is stores in the .container
  * field.
  */
function getExtendedPropertyDescriptor(obj, propName) {
    let desc;
    while (obj && !desc) {
        desc = Object.getOwnPropertyDescriptor(obj, propName);
        if (desc) {
            desc.container = obj;
        }
        obj = Object.getPrototypeOf(obj);
    }
    return desc;
}
function defineProperty(obj, propName, desc) {
    __DEV__ && assert(!!desc, "invalid proper description");
    try {
        Object.defineProperty(obj, propName, desc);
    }
    catch (e) {
        __DEV__ && console.warn(propName, " defining throws exception : ", e, " on ", obj);
    }
}
const ObjectHasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwnProperty(obj, propName) {
    return ObjectHasOwnProperty.call(obj, propName);
}
function copyOwnProperties(src, dest) {
    if (!src || !dest) {
        // Not much to copy. This can legitimately happen if for example function/attribute value is undefined during interception.
        return;
    }
    const ownProps = Object.getOwnPropertyNames(src);
    for (let i = 0, length = ownProps.length; i < length; ++i) {
        const propName = ownProps[i];
        if (!(propName in dest)) {
            const desc = Object.getOwnPropertyDescriptor(src, propName); //Since we are iterating the getOwnPropertyNames, we know this must have value
            assert(desc != null, `Unexpected situation, we should have own property for ${propName}`);
            try {
                Object.defineProperty(dest, propName, desc);
            }
            catch (e) {
                __DEV__ && console.error("Adding property ", propName, " throws exception: ", e);
            }
        }
    }
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
const unknownFunc = function () {
    console.warn('Unknown or missing function called! ');
};
class OnArgsMapper extends Hook {
}
class OnArgsObserver extends Hook {
}
class OnValueMapper extends Hook {
}
class OnValueObserver extends Hook {
}
class FunctionInterceptorBase extends PropertyInterceptor {
    onArgsMapper;
    onArgsObserver;
    onValueMapper;
    onValueObserver;
    original = unknownFunc;
    customFunc;
    implementation; // usually either the .original or the .customFunc
    interceptor;
    dispatcherFunc;
    constructor(name, originalFunc = unknownFunc) {
        super(name);
        const that = this;
        this.interceptor = function () {
            // In all cases we are dealing with methods, we handle constructors separately.
            // It is too cumbersome (and perf inefficient) to separate classes for methods and constructors.
            // TODO: is there a runtime check we can do to ensure this? e.g. checking func.prototype? Some constructors are functions too! 
            return (that.dispatcherFunc).apply(this, arguments);
        };
        this.implementation = originalFunc;
        this.dispatcherFunc = this.original; // By default just pass on to original
        this.setOriginal(originalFunc); // to perform any extra bookkeeping
    }
    getOriginal() {
        return this.original;
    }
    setOriginal(originalFunc) {
        if (this.original === originalFunc) {
            return; // not much left to do
        }
        this.original = originalFunc;
        if (!this.customFunc) {
            // If no custom function is set, the implementation should point to original function
            this.implementation = originalFunc;
        }
        /**
         * We should make interceptor look as much like the original as possible.
         * This includes {.name, .prototype, .toString(), ...}
         * Note that copyOwnProperties will skip properties that destination already has
         * therefore we might have to copy some properties manually
         */
        copyOwnProperties(originalFunc, this.interceptor);
        this.interceptor.toString = function () {
            return originalFunc.toString();
        };
        this.updateDispatcherFunc();
    }
    setCustom(customFunc) {
        // Once we have custom implementation, we chose that from that point on
        __DEV__ && assert(!this.customFunc, `There is already a custom function assigned to ${this.name}`);
        this.customFunc = customFunc;
        this.implementation = customFunc;
        this.updateDispatcherFunc();
    }
    static dispatcherCtors = (() => {
        // type T = { "foo": InterceptableFunction };
        // const ctors: { [index: number]: (fi: FunctionInterceptor<"foo", T>) => Function } = {
        const ctors = {
            [0 /* Has_____________ */]: fi => fi.customFunc ?? fi.original,
            [1 /* Has___________VO */]: fi => function () {
                let result;
                result = fi.implementation.apply(this, arguments);
                fi.onValueObserver.call.call(this, result);
                return result;
            },
            [2 /* Has________VF___ */]: fi => function () {
                let result;
                result = fi.implementation.apply(this, arguments);
                result = fi.onValueMapper.call.call(this, result);
                return result;
            },
            [3 /* Has________VF_VO */]: fi => function () {
                let result;
                result = fi.implementation.apply(this, arguments);
                result = fi.onValueMapper.call.call(this, result);
                fi.onValueObserver.call.call(this, result);
                return result;
            },
            [4 /* Has____AO_______ */]: fi => function () {
                let result;
                if (!fi.onArgsObserver.call.apply(this, arguments)) {
                    result = fi.implementation.apply(this, arguments);
                }
                return result;
            },
            [5 /* Has____AO_____VO */]: fi => function () {
                let result;
                if (!fi.onArgsObserver.call.apply(this, arguments)) {
                    result = fi.implementation.apply(this, arguments);
                    fi.onValueObserver.call.call(this, result);
                }
                return result;
            },
            [6 /* Has____AO__VF___ */]: fi => function () {
                let result;
                if (!fi.onArgsObserver.call.apply(this, arguments)) {
                    result = fi.implementation.apply(this, arguments);
                    result = fi.onValueMapper.call.call(this, result);
                }
                return result;
            },
            [7 /* Has____AO__VF_VO */]: fi => function () {
                let result;
                if (!fi.onArgsObserver.call.apply(this, arguments)) {
                    result = fi.implementation.apply(this, arguments);
                    result = fi.onValueMapper.call.call(this, result);
                    fi.onValueObserver.call.call(this, result);
                }
                return result;
            },
            [8 /* Has_AF__________ */]: fi => function () {
                let result;
                const filteredArgs = fi.onArgsMapper.call.call(this, arguments); //Pass as an array
                result = fi.implementation.apply(this, filteredArgs);
                return result;
            },
            [9 /* Has_AF________VO */]: fi => function () {
                let result;
                const filteredArgs = fi.onArgsMapper.call.call(this, arguments); //Pass as an array
                result = fi.implementation.apply(this, filteredArgs);
                fi.onValueObserver.call.call(this, result);
                return result;
            },
            [10 /* Has_AF_____VF___ */]: fi => function () {
                let result;
                const filteredArgs = fi.onArgsMapper.call.call(this, arguments); //Pass as an array
                result = fi.implementation.apply(this, filteredArgs);
                result = fi.onValueMapper.call.call(this, result);
                return result;
            },
            [11 /* Has_AF_____VF_VO */]: fi => function () {
                let result;
                const filteredArgs = fi.onArgsMapper.call.call(this, arguments); //Pass as an array
                result = fi.implementation.apply(this, filteredArgs);
                result = fi.onValueMapper.call.call(this, result);
                fi.onValueObserver.call.call(this, result);
                return result;
            },
            [12 /* Has_AF_AO_______ */]: fi => function () {
                let result;
                const filteredArgs = fi.onArgsMapper.call.call(this, arguments); //Pass as an array
                if (!fi.onArgsObserver.call.apply(this, filteredArgs)) {
                    result = fi.implementation.apply(this, filteredArgs);
                }
                return result;
            },
            [13 /* Has_AF_AO_____VO */]: fi => function () {
                let result;
                const filteredArgs = fi.onArgsMapper.call.call(this, arguments); //Pass as an array
                if (!fi.onArgsObserver.call.apply(this, filteredArgs)) {
                    result = fi.implementation.apply(this, filteredArgs);
                    fi.onValueObserver.call.call(this, result);
                }
                return result;
            },
            [14 /* Has_AF_AO__VF___ */]: fi => function () {
                let result;
                const filteredArgs = fi.onArgsMapper.call.call(this, arguments); //Pass as an array
                if (!fi.onArgsObserver.call.apply(this, filteredArgs)) {
                    result = fi.implementation.apply(this, filteredArgs);
                    result = fi.onValueMapper.call.call(this, result);
                }
                return result;
            },
            [15 /* Has_AF_AO__VF_VO */]: fi => function () {
                let result;
                const filteredArgs = fi.onArgsMapper.call.call(this, arguments); //Pass as an array
                if (!fi.onArgsObserver.call.apply(this, filteredArgs)) {
                    result = fi.implementation.apply(this, filteredArgs);
                    result = fi.onValueMapper.call.call(this, result);
                    fi.onValueObserver.call.call(this, result);
                }
                return result;
            },
        };
        if (__DEV__) {
            // just to make sure we caovered all cases correctly
            for (let i = 8 /* HasArgsMapper */ | 4 /* HasArgsObserver */ | 2 /* HasValueMapper */ | 1 /* HasValueObserver */; i >= 0; --i) {
                const ctor = ctors[i];
                assert(!!ctor, `unhandled interceptor state ${i}`);
                ctors[i] = fi => {
                    assert((i & 8 /* HasArgsMapper */) === 0 || !!fi.onArgsMapper, `missing expected .onArgsFilter for state ${i}`);
                    assert((i & 4 /* HasArgsObserver */) === 0 || !!fi.onArgsObserver, `missing expected .onArgsObserver for state ${i}`);
                    assert((i & 2 /* HasValueMapper */) === 0 || !!fi.onValueMapper, `missing expected .onValueFilter for state ${i}`);
                    assert((i & 1 /* HasValueObserver */) === 0 || !!fi.onValueObserver, `missing expected .onValueObserver for state ${i}`);
                    return ctor(fi);
                };
            }
        }
        return ctors;
    })();
    updateDispatcherFunc() {
        let state = 0;
        state |= this.onArgsMapper ? 8 /* HasArgsMapper */ : 0;
        state |= this.onArgsObserver ? 4 /* HasArgsObserver */ : 0;
        state |= this.onValueMapper ? 2 /* HasValueMapper */ : 0;
        state |= this.onValueObserver ? 1 /* HasValueObserver */ : 0;
        //TODO: Check a cached version first
        const dispatcherCtor = FunctionInterceptorBase.dispatcherCtors[state];
        assert(!!dispatcherCtor, `unhandled interceptor state ${state}`);
        this.dispatcherFunc = dispatcherCtor(this);
    }
    //#region helper function to lazily extend hooks
    onArgsMapperAdd(cb) {
        if (!this.onArgsMapper) {
            this.onArgsMapper = new OnArgsMapper();
            this.updateDispatcherFunc();
        }
        return this.onArgsMapper.add(cb);
    }
    onArgsMapperRemove(cb) {
        if (this.onArgsMapper?.remove(cb)) {
            this.updateDispatcherFunc();
        }
        return cb;
    }
    onArgsObserverAdd(cb) {
        if (!this.onArgsObserver) {
            this.onArgsObserver = new OnArgsObserver();
            this.updateDispatcherFunc();
        }
        return this.onArgsObserver.add(cb);
    }
    onArgsObserverRemove(cb) {
        if (this.onArgsObserver?.remove(cb)) {
            this.updateDispatcherFunc();
        }
        return cb;
    }
    onValueMapperAdd(cb) {
        if (!this.onValueMapper) {
            this.onValueMapper = new OnValueMapper();
            this.updateDispatcherFunc();
        }
        return this.onValueMapper.add(cb);
    }
    onValueMapperRemove(cb) {
        if (this.onValueMapper?.remove(cb)) {
            this.updateDispatcherFunc();
        }
        return cb;
    }
    onValueObserverAdd(cb) {
        if (!this.onValueObserver) {
            this.onValueObserver = new OnValueObserver();
            this.updateDispatcherFunc();
        }
        return this.onValueObserver.add(cb);
    }
    onValueObserverRemove(cb) {
        if (this.onValueObserver?.remove(cb)) {
            this.updateDispatcherFunc();
        }
        return cb;
    }
}
class FunctionInterceptor extends FunctionInterceptorBase {
    constructor(name, shadowPrototype) {
        super(name);
        this.interceptProperty(shadowPrototype.targetPrototype, false);
        if (this.status !== 1 /* Intercepted */) {
            shadowPrototype.addPendingPropertyInterceptor(this);
        }
    }
    interceptProperty(obj, isOwnProperty) {
        let desc = getExtendedPropertyDescriptor(obj, this.name);
        if (isOwnProperty) {
            let virtualProperty; // TODO: we should do this on the object itself
            if (desc) {
                if (desc.value && desc.writable) { // it has value and can change
                    virtualProperty = desc.value;
                    delete desc.value;
                    delete desc.writable;
                    desc.get = function () { return virtualProperty; };
                    desc.set = function (value) { virtualProperty = value; };
                    desc.configurable = true;
                }
            }
            else {
                desc = {
                    get: function () { return virtualProperty; },
                    set: function (value) { virtualProperty = value; },
                    enumerable: true,
                    configurable: true,
                    container: obj
                };
            }
        }
        if (desc) {
            if (desc.value) {
                this.setOriginal(desc.value);
                desc.value = this.interceptor;
                defineProperty(desc.container, this.name, desc);
                this.status = 1 /* Intercepted */;
            }
            else if (desc.get || desc.set) {
                const that = this;
                const { get, set } = desc;
                if (get) {
                    desc.get = function () {
                        const originalFunc = get.call(this);
                        if (originalFunc !== that.interceptor) {
                            that.setOriginal(originalFunc);
                        }
                        return that.interceptor;
                    };
                }
                if (set) {
                    desc.set = function (value) {
                        // set.call(this, value);
                        set.call(this, that.interceptor);
                        if (value !== that.interceptor && value !== that.original) {
                            that.setOriginal(value);
                        }
                        return that.interceptor;
                    };
                }
                defineProperty(desc.container, this.name, desc);
                this.status = desc.configurable ? 1 /* Intercepted */ : 4 /* NotConfigurable */;
            }
            else {
                __DEV__ && assert(false, `unexpected situation! PropertyDescriptor does not have value or get/set!`);
            }
        }
        else {
            this.status = 2 /* NotFound */;
        }
    }
    interceptObjectOwnProperties(obj) {
        this.interceptProperty(obj, true);
    }
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
function getVirtualPropertyName(name, extension) {
    return extension?.useCaseInsensitivePropertyName ? ('' + name).toLocaleLowerCase() : name;
}
class ShadowPrototype {
    targetPrototype;
    parentShadoPrototype;
    extension;
    onBeforInterceptObj = new Hook();
    onAfterInterceptObj = new Hook();
    pendingPropertyInterceptors;
    constructor(targetPrototype, parentShadoPrototype) {
        this.targetPrototype = targetPrototype;
        this.parentShadoPrototype = parentShadoPrototype;
        /**
         * TODO: if we could say <ObjectType extends ParentType> then may be we could avoid the casts
         * in the following methods
         */
        this.extension = Object.create(parentShadoPrototype?.extension ?? null);
        if ( /* __DEV__ && */this.parentShadoPrototype) {
            let obj = this.targetPrototype;
            let proto = this.parentShadoPrototype.targetPrototype;
            let matched = false;
            while (obj && !matched) {
                matched = obj === proto;
                obj = Object.getPrototypeOf(obj);
            }
            assert(matched, `Invalid prototype chain`);
        }
    }
    callOnBeforeInterceptObject(obj) {
        this.parentShadoPrototype?.callOnBeforeInterceptObject(obj);
        this.onBeforInterceptObj?.call(obj);
    }
    callOnAfterInterceptObject(obj) {
        this.parentShadoPrototype?.callOnAfterInterceptObject(obj);
        this.onAfterInterceptObj?.call(obj);
    }
    interceptObjectItself(obj) {
        this.parentShadoPrototype?.interceptObjectItself(obj);
        // We can make any necessary modificatio to the object itself here
        if (this.pendingPropertyInterceptors) {
            for (const pi of this.pendingPropertyInterceptors) {
                pi.interceptObjectOwnProperties(obj);
            }
        }
    }
    interceptObject(obj) {
        // This behaves similar to how constructors work, i.e. from parent class to child class
        this.callOnBeforeInterceptObject(obj);
        this.interceptObjectItself(obj);
        this.callOnAfterInterceptObject(obj);
    }
    addPendingPropertyInterceptor(pi) {
        if (!this.pendingPropertyInterceptors) {
            this.pendingPropertyInterceptors = [];
        }
        this.pendingPropertyInterceptors.push(pi);
    }
    getVirtualProperty(name) {
        const vtable = this.extension;
        const canonicalName = getVirtualPropertyName(name, vtable);
        return vtable[canonicalName];
    }
    setVirtualProperty(name, virtualProp) {
        const vtable = this.extension;
        const canonicalName = getVirtualPropertyName(name, vtable);
        if (__DEV__) {
            assert(!hasOwnProperty(vtable, canonicalName), `Vritual property ${name} already exists`);
            assert(!vtable[canonicalName], `virtual property ${name} will override the parent's.`, { logger: { error(msg) { console.warn(msg); } } });
        }
        vtable[canonicalName] = virtualProp;
        return virtualProp;
    }
    removeVirtualPropery(name, virtualProp) {
        const vtable = this.extension;
        const canonicalName = getVirtualPropertyName(name, vtable);
        if (__DEV__) {
            assert(hasOwnProperty(vtable, canonicalName), `Vritual property ${name} does not exists`);
        }
        if (vtable[canonicalName] === virtualProp) {
            delete vtable[canonicalName];
        }
        else {
            console.error(`Vritual property ${name} does not match and was not deleted`);
        }
    }
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
const ExtensionPropName = "__ext";
const ShadowPrototypePropName = "__sproto";
let extensionId = 0;
const shadowPrototypeGetters = [];
/**
 * @param getter function to map a given object to a shadow prototype
 * @returns a function that can remove the getter.
 */
function registerShadowPrototypeGetter(getter) {
    shadowPrototypeGetters.push(getter);
    return (() => {
        const index = shadowPrototypeGetters.indexOf(getter);
        if (index > -1) {
            shadowPrototypeGetters.splice(index, 1);
        }
    });
}
/**
 * intercept function can look up the prototype chain to find a proper ShadowPrototype for intercepting
 * a given object.
 * You should be careful to call this function on non-leaf nodes of the prototype chain.
 * This will be the last priority after the shadowPrototypeGetters is tried
 */
function registerShadowPrototype(protoObj, shadowPrototype) {
    __DEV__ && assert(!protoObj[ShadowPrototypePropName], `hiding existing ShadowPrototype in the chain of prototype ${protoObj}.`, { logger: { error: msg => console.debug(msg) } });
    Object.defineProperty(protoObj, ShadowPrototypePropName, {
        value: shadowPrototype,
        // configurable: true,
    });
}
let cachedPropertyDescriptor = {
/** Want all the following fields to be false, but should not specify explicitly
 * enumerable: false,
 * writable: false,
 * configurable: false
 */
};
function isInterceptable(value) {
    /**
     * Generally we want to intercept objects and functions
     * Html tags are generally object, but some browsers use function for tags such as <object>, <embed>, ...
     */
    let typeofValue = typeof value;
    return value &&
        (typeofValue === "object" || typeofValue === "function");
}
function isIntercepted(value) {
    return hasOwnProperty(value, ExtensionPropName);
}
function intercept(value, shadowPrototype) {
    if (isInterceptable(value) && !isIntercepted(value)) {
        __DEV__ && assert(!!shadowPrototype || !value[ExtensionPropName], "Unexpected situation");
        // TODO: check for custom interceptors
        let shadowProto = shadowPrototype;
        for (let i = 0; !shadowProto && i < shadowPrototypeGetters.length; ++i) {
            shadowProto = shadowPrototypeGetters[i](value);
        }
        if (!shadowProto) {
            shadowProto = value[ShadowPrototypePropName];
        }
        if (shadowProto) {
            let extension = {
                virtualPropertyValues: {},
                shadowPrototype: shadowProto,
                id: extensionId++,
            };
            cachedPropertyDescriptor.value = extension;
            Object.defineProperty(value, ExtensionPropName, cachedPropertyDescriptor); // has to be done before interception starts
            shadowProto.interceptObject(value);
        }
    }
    return value;
}
function getObjectExtension(obj, interceptIfAbsent) {
    __DEV__ && assert(isInterceptable(obj), "Only objects or functions are allowed");
    let ext = obj[ExtensionPropName];
    if (!ext && interceptIfAbsent) {
        intercept(obj);
        ext = obj[ExtensionPropName];
    }
    return ext;
}
function getVirtualPropertyValue(obj, propName) {
    const ext = getObjectExtension(obj, true);
    return ext?.virtualPropertyValues[propName];
}
function setVirtualPropertyValue(obj, propName, value) {
    const ext = getObjectExtension(obj, true);
    if (ext) {
        ext.virtualPropertyValues[propName] = value;
    }
    else {
        assert(!!ext, `Could not get extension for the object`);
    }
    return value;
}
function interceptFunction(func, fiCtor, name = `_annonymous`) {
    assert(typeof func === "function", `cannot intercept non-function input`);
    let funcInterceptor = func[ExtensionPropName];
    if (!funcInterceptor) {
        funcInterceptor = fiCtor ? new fiCtor(name, func) : new FunctionInterceptorBase(name, func);
        func[ExtensionPropName] = funcInterceptor;
        funcInterceptor.interceptor[ExtensionPropName] = funcInterceptor;
    }
    return funcInterceptor;
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
const NodeType2ShadoPrototype = new Map();
const NodeName2ShadoPrototype = new Map();
registerShadowPrototypeGetter(node => {
    if (node instanceof Node) {
        return NodeName2ShadoPrototype.get(node.nodeName) ?? NodeType2ShadoPrototype.get(node.nodeType);
    }
    return null;
});
class DOMShadowPrototype extends ShadowPrototype {
    constructor(targetPrototypeCtor, parentShadoPrototype, options) {
        let targetPrototype = targetPrototypeCtor?.prototype;
        if (!targetPrototype && options) {
            const { sampleObject, nodeName, nodeType } = options;
            let obj = sampleObject;
            if (!obj && nodeType) {
                switch (nodeType) {
                    // case window.document.ATTRIBUTE_NODE: obj = document.createElement(""); break;
                    // case window.document.CDATA_SECTION_NODE: obj = document.createElement(""); break;
                    // case window.document.COMMENT_NODE: obj = document.createElement(""); break;
                    // case window.document.DOCUMENT_FRAGMENT_NODE: obj = document.createElement(""); break;
                    case window.document.DOCUMENT_NODE:
                        obj = window.document;
                        break;
                    // case window.document.DOCUMENT_POSITION_CONTAINED_BY: obj = document.createElement(""); break;
                    // case window.document.DOCUMENT_POSITION_CONTAINS: obj = document.createElement(""); break;
                    // case window.document.DOCUMENT_POSITION_DISCONNECTED: obj = document.createElement(""); break;
                    // case window.document.DOCUMENT_POSITION_FOLLOWING: obj = document.createElement(""); break;
                    // case window.document.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: obj = document.createElement(""); break;
                    // case window.document.DOCUMENT_POSITION_PRECEDING: obj = document.createElement(""); break;
                    // case window.document.DOCUMENT_TYPE_NODE: obj = document.createElement(""); break;
                    case window.document.ELEMENT_NODE:
                        obj = sampleHTMLElement;
                        break;
                    // case window.document.ENTITY_NODE: obj = document.createElement(""); break;
                    // case window.document.ENTITY_REFERENCE_NODE: obj = document.createElement(""); break;
                    // case window.document.NOTATION_NODE: obj = document.createElement(""); break;
                    // case window.document.PROCESSING_INSTRUCTION_NODE: obj = document.createElement(""); break;
                    // case window.document.TEXT_NODE: obj = document.createElement(""); break;
                    default:
                        assert(false, `Unsupported and unexpected nodeType ${nodeType}`);
                        break;
                }
            }
            if (!obj && nodeName) {
                obj = window.document.createElement(nodeName);
            }
            if (obj) {
                targetPrototype = Object.getPrototypeOf(obj);
            }
        }
        assert(typeof targetPrototype === "object", `Cannot create shadow prototype for undefined`);
        super(targetPrototype, parentShadoPrototype);
        if (options) {
            const { nodeName, nodeType } = options;
            if (nodeName) {
                NodeName2ShadoPrototype.set(nodeName.toUpperCase(), this);
            }
            if (nodeType) {
                NodeType2ShadoPrototype.set(nodeType, this);
            }
        }
        if (options?.registerOnPrototype && targetPrototype) {
            /**
             * We can now only rely on the prototype itself, so we can register the shadow on the actual prototype
             * However, in some cases we may run into exception if the object is frozen or cross origin in the browser.
             */
            try {
                registerShadowPrototype(targetPrototype, this);
            }
            catch (e) {
                console.error(`Could not register shadow prototype on the prototype object.`);
            }
        }
    }
}
const sampleHTMLElement = window.document.head;
function getVirtualAttribute(obj, name) {
    let shadowProto = getObjectExtension(obj, true)?.shadowPrototype;
    if (!shadowProto) {
        return null;
    }
    if (__DEV__) {
        /**
         * For DOM node, HTML nodes use case insensitive attributes,
         * while other node types (e.g. svg, xml, ...) use case sensitive attribute names
         * we can check this based on the namespaceURI of the node
         * https://developer.mozilla.org/en-US/docs/Web/API/Element/namespaceURI
         */
        assert(obj.namespaceURI !== "http://www.w3.org/1999/xhtml" || shadowProto.extension.useCaseInsensitivePropertyName, `HTML Elements shadow prototypes should use case insensitive naming`);
    }
    return shadowProto.getVirtualProperty(name);
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
const IEventTargetPrototype = new DOMShadowPrototype(EventTarget, null, { sampleObject: sampleHTMLElement });
const addEventListener = new FunctionInterceptor('addEventListener', IEventTargetPrototype);
new FunctionInterceptor('dispatchEvent', IEventTargetPrototype);
const removeEventListener = new FunctionInterceptor('removeEventListener', IEventTargetPrototype);

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
const INodePrototype = new DOMShadowPrototype(Node, IEventTargetPrototype, { sampleObject: sampleHTMLElement });
const appendChild = new FunctionInterceptor('appendChild', INodePrototype);
new FunctionInterceptor('cloneNode', INodePrototype);
const insertBefore = new FunctionInterceptor('insertBefore', INodePrototype);
const removeChild = new FunctionInterceptor('removeChild', INodePrototype);
const replaceChild = new FunctionInterceptor('replaceChild', INodePrototype);

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
class AttributeInterceptorBase extends PropertyInterceptor {
    getter;
    setter;
    constructor(name, getter, setter) {
        super(name);
        this.getter = new FunctionInterceptorBase(name, getter);
        this.setter = new FunctionInterceptorBase(name, setter);
    }
}
class AttributeInterceptor extends AttributeInterceptorBase {
    constructor(name, shadowPrototype) {
        super(name);
        this.interceptProperty(shadowPrototype.targetPrototype, false);
        if (this.status !== 1 /* Intercepted */) {
            shadowPrototype.addPendingPropertyInterceptor(this);
        }
    }
    interceptProperty(obj, isOwnProperty) {
        let desc = getExtendedPropertyDescriptor(obj, this.name);
        if (isOwnProperty) {
            let virtualProperty; // TODO: we should do this on the object itself
            const get = function () {
                return virtualProperty;
            };
            const set = function (value) {
                virtualProperty = value;
            };
            if (desc) {
                if (desc.value && desc.writable) { // it has value and can change
                    virtualProperty = desc.value;
                    delete desc.value;
                    delete desc.writable;
                    desc.get = get;
                    desc.set = set;
                    desc.configurable = true;
                }
            }
            else {
                desc = {
                    get,
                    set,
                    enumerable: true,
                    configurable: true,
                    container: obj
                };
            }
        }
        if (desc) {
            if (desc.get || desc.set) {
                const { get, set } = desc;
                if (get) {
                    this.getter.setOriginal(get);
                    desc.get = this.getter.interceptor;
                }
                if (set) {
                    this.setter.setOriginal(set);
                    desc.set = this.setter.interceptor;
                }
                __DEV__ && assert(desc.configurable, `Cannot intercept attribute ${this.name}`);
                defineProperty(desc.container, this.name, desc);
                if (__DEV__) {
                    const desc = getExtendedPropertyDescriptor(obj, this.name);
                    assert(desc?.get === this.getter.interceptor, `getter interceptor did not work`);
                    assert(desc?.set === this.setter.interceptor, `setter interceptor did not work`);
                }
                this.status = desc.configurable ? 1 /* Intercepted */ : 4 /* NotConfigurable */;
            }
            else if (desc.value) {
                //TODO: we should replace this one with get/set
                console.warn(`Property ${this.name} does not seem to be an attribute`);
                this.status = 3 /* NoGetterSetter */;
            }
            else {
                if (__DEV__) {
                    if (hasOwnProperty(desc, "get") || hasOwnProperty(desc, "set")) {
                        console.warn(`Un expected situation, attribute ${this.name} does not have getter/setter defined`);
                    }
                }
            }
        }
        else {
            this.status = 2 /* NotFound */;
        }
    }
    interceptObjectOwnProperties(obj) {
        return this.interceptProperty(obj, true);
    }
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 *
 * This file only contains set of features that ElementAttributeInterceptor
 * needs. They are here to avoid circular depndency between modules.
 */
const IElementtPrototype$1 = new DOMShadowPrototype(Element, INodePrototype, {
    sampleObject: sampleHTMLElement,
    nodeType: document.ELEMENT_NODE
});
IElementtPrototype$1.extension.useCaseInsensitivePropertyName = true;
const getAttribute = new FunctionInterceptor('getAttribute', IElementtPrototype$1);
const getAttributeNS = new FunctionInterceptor('getAttributeNS', IElementtPrototype$1);
// export const getAttributeNames = new FunctionInterceptor('getAttributeNames', IElementtPrototype);
// export const getAttributeNode = new FunctionInterceptor('getAttributeNode', IElementtPrototype);
// export const getAttributeNodeNS = new FunctionInterceptor('getAttributeNodeNS', IElementtPrototype);
// export const getBoundingClientRect = new FunctionInterceptor('getBoundingClientRect', IElementtPrototype);
// export const getClientRects = new FunctionInterceptor('getClientRects', IElementtPrototype);
// export const getElementsByClassName = new FunctionInterceptor('getElementsByClassName', IElementtPrototype);
// export const getElementsByTagName = new FunctionInterceptor('getElementsByTagName', IElementtPrototype);
// export const getElementsByTagNameNS = new FunctionInterceptor('getElementsByTagNameNS', IElementtPrototype);
// export const hasAttribute = new FunctionInterceptor('hasAttribute', IElementtPrototype);
// export const hasAttributeNS = new FunctionInterceptor('hasAttributeNS', IElementtPrototype);
// export const hasAttributes = new FunctionInterceptor('hasAttributes', IElementtPrototype);
// export const insertAdjacentElement = new FunctionInterceptor('insertAdjacentElement', IElementtPrototype);
// export const insertAdjacentHTML = new FunctionInterceptor('insertAdjacentHTML', IElementtPrototype);
// export const insertAdjacentText = new FunctionInterceptor('insertAdjacentText', IElementtPrototype);
// export const removeAttribute = new FunctionInterceptor('removeAttribute', IElementtPrototype);
// export const removeAttributeNS = new FunctionInterceptor('removeAttributeNS', IElementtPrototype);
// export const removeAttributeNode = new FunctionInterceptor('removeAttributeNode', IElementtPrototype);
const setAttribute = new FunctionInterceptor('setAttribute', IElementtPrototype$1);
const setAttributeNS = new FunctionInterceptor('setAttributeNS', IElementtPrototype$1);
const setAttributeNode = new FunctionInterceptor('setAttributeNode', IElementtPrototype$1);
const setAttributeNodeNS = new FunctionInterceptor('setAttributeNodeNS', IElementtPrototype$1);

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
const IAttrPrototype = new DOMShadowPrototype(Attr, INodePrototype, {
    sampleObject: sampleHTMLElement.attributes[0],
    nodeType: document.ATTRIBUTE_NODE
});
const value = new AttributeInterceptor("value", IAttrPrototype);

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
function init$1() {
    value.getter.setCustom(function () {
        var attr = this;
        var ownerElement = attr.ownerElement;
        if (ownerElement) {
            var vattr = getVirtualAttribute(ownerElement, attr.name);
            if (vattr) {
                var attrVal = vattr.getRawValue(ownerElement);
                if (attrVal != null) {
                    return attrVal;
                }
            }
        }
        return value.getter.getOriginal().call(attr);
    });
    value.setter.setCustom(function (value$1) {
        var attr = this;
        var ownerElement = attr.ownerElement;
        if (ownerElement) {
            var vattr = getVirtualAttribute(ownerElement, attr.name);
            if (vattr) {
                return vattr.setRawValue(ownerElement, value$1);
            }
        }
        return value.setter.getOriginal().call(attr, value$1);
    });
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
function init() {
    getAttribute.setCustom(function (name) {
        const vattr = getVirtualAttribute(this, name);
        if (vattr) {
            const attrVal = vattr.getRawValue(this);
            if (attrVal !== null) {
                return attrVal;
            }
        }
        return getAttribute.getOriginal().apply(this, arguments);
    });
    setAttribute.setCustom(function (name, value) {
        const vattr = getVirtualAttribute(this, name);
        if (vattr) {
            return vattr.setRawValue(this, value);
        }
        else {
            return setAttribute.getOriginal().apply(this, arguments);
        }
    });
    getAttributeNS.setCustom(function (_namespace, name) {
        const vattr = getVirtualAttribute(this, name);
        if (vattr) {
            var attrVal = vattr.getRawValue(this);
            if (attrVal !== null) {
                return attrVal;
            }
        }
        return getAttributeNS.getOriginal().apply(this, arguments);
    });
    setAttributeNS.setCustom(function (_namespace, name, value) {
        const vattr = getVirtualAttribute(this, name);
        if (vattr) {
            return vattr.setRawValue(this, value);
        }
        else {
            return setAttributeNS.getOriginal().apply(this, arguments);
        }
    });
    function createSetAttributeNodeCustom(originalFunc) {
        return function (newAttr) {
            var result;
            const notAlreadyAttached = !newAttr.ownerElement;
            const vattr = getVirtualAttribute(this, newAttr.name);
            if (notAlreadyAttached && vattr) {
                //The custom logic for Attr has not run before (see IAttrCustom), so trigger it now
                const value = newAttr.value; //In case .value changes after attaching, or if there is pending custom logic
                result = originalFunc.call(this, newAttr);
                __DEV__ && assert(!!newAttr.ownerElement, "Attr must now be attached to an ownerElement");
                vattr.setRawValue(this, value);
            }
            else {
                result = originalFunc.call(this, newAttr);
            }
            return result;
        };
    }
    setAttributeNode.setCustom(createSetAttributeNodeCustom(setAttributeNode.getOriginal()));
    setAttributeNodeNS.setCustom(createSetAttributeNodeCustom(setAttributeNodeNS.getOriginal()));
    //TODO: add logic for removeAttribute*
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
class VirtualAttribute {
    rawValue;
    processedValue;
    constructor(rawValue, processedValue) {
        this.rawValue = rawValue;
        this.processedValue = processedValue;
    }
    getRawValue(obj) {
        return this.rawValue.getter.interceptor.call(obj);
    }
    setRawValue(obj, value) {
        return this.rawValue.setter.interceptor.call(obj, value);
    }
    getProcessedValue(obj) {
        return this.processedValue.getter.interceptor.call(obj);
    }
    setProcessedValue(obj, value) {
        return this.processedValue.setter.interceptor.call(obj, value);
    }
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
let lazyInit = () => {
    init$1();
    init();
    lazyInit = () => { };
};
class ElementAttributeInterceptor extends AttributeInterceptor {
    raw;
    constructor(name, shadowPrototype) {
        super(name, shadowPrototype);
        this.raw = new AttributeInterceptorBase(name, function () {
            return getAttribute.getOriginal().call(this, name);
        }, function (value) {
            return setAttribute.getOriginal().call(this, name, value);
        });
        IElementtPrototype$1.setVirtualProperty(name, new VirtualAttribute(this.raw, this));
        lazyInit();
    }
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
// export const IElementtPrototype = new DOMShadowPrototype(
//   Element,
//   INodePrototype,
//   {
//     sampleObject: sampleHTMLElement,
//     nodeType: document.ELEMENT_NODE
//   }
// );
const IElementtPrototype = IElementtPrototype$1;
IElementtPrototype.extension.useCaseInsensitivePropertyName = true;
// export const getAttribute = new FunctionInterceptor('getAttribute', IElementtPrototype);
// export const getAttributeNS = new FunctionInterceptor('getAttributeNS', IElementtPrototype);
new FunctionInterceptor('getAttributeNames', IElementtPrototype);
new FunctionInterceptor('getAttributeNode', IElementtPrototype);
new FunctionInterceptor('getAttributeNodeNS', IElementtPrototype);
new FunctionInterceptor('getBoundingClientRect', IElementtPrototype);
new FunctionInterceptor('getClientRects', IElementtPrototype);
new FunctionInterceptor('getElementsByClassName', IElementtPrototype);
new FunctionInterceptor('getElementsByTagName', IElementtPrototype);
new FunctionInterceptor('getElementsByTagNameNS', IElementtPrototype);
new FunctionInterceptor('hasAttribute', IElementtPrototype);
new FunctionInterceptor('hasAttributeNS', IElementtPrototype);
new FunctionInterceptor('hasAttributes', IElementtPrototype);
const insertAdjacentElement = new FunctionInterceptor('insertAdjacentElement', IElementtPrototype);
new FunctionInterceptor('insertAdjacentHTML', IElementtPrototype);
new FunctionInterceptor('insertAdjacentText', IElementtPrototype);
new FunctionInterceptor('removeAttribute', IElementtPrototype);
new FunctionInterceptor('removeAttributeNS', IElementtPrototype);
new FunctionInterceptor('removeAttributeNode', IElementtPrototype);
// export const setAttribute = new FunctionInterceptor('setAttribute', IElementtPrototype);
// export const setAttributeNS = new FunctionInterceptor('setAttributeNS', IElementtPrototype);
// export const setAttributeNode = new FunctionInterceptor('setAttributeNode', IElementtPrototype);
// export const setAttributeNodeNS = new FunctionInterceptor('setAttributeNodeNS', IElementtPrototype);
new FunctionInterceptor('toggleAttribute', IElementtPrototype);
new ElementAttributeInterceptor("id", IElementtPrototype);
const innerHTML = new AttributeInterceptor("innerHTML", IElementtPrototype);

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
const onDOMMutation = new Hook();
appendChild.onArgsObserverAdd(function (value) {
    onDOMMutation.call({
        action: "added",
        target: this,
        nodes: [value],
    });
});
insertBefore.onArgsObserverAdd(function (newNode, _referenceNode) {
    onDOMMutation.call({
        action: "added",
        target: this,
        nodes: [newNode],
    });
});
removeChild.onArgsObserverAdd(function (node) {
    onDOMMutation.call({
        action: "removed",
        target: this,
        nodes: [node],
    });
});
replaceChild.onArgsObserverAdd(function (newChild, oldChild) {
    onDOMMutation.call({
        action: "removed",
        target: this,
        nodes: [oldChild]
    });
    onDOMMutation.call({
        action: "added",
        target: this,
        nodes: [newChild]
    });
});
innerHTML.setter.onArgsObserverAdd(function (_value) {
    // Happens before actual call, so current children will be removed
    onDOMMutation.call({
        action: "removed",
        target: this,
        nodes: Array.from(this.childNodes),
    });
});
innerHTML.setter.onValueObserverAdd(function () {
    // Happens after actual call, so current children will are the ones added
    onDOMMutation.call({
        action: "added",
        target: this,
        nodes: Array.from(this.childNodes),
    });
});
insertAdjacentElement.onArgsObserverAdd(function (where, element) {
    const target = where === "afterbegin" || where === "beforeend" ? this : this.parentNode;
    if (target) {
        onDOMMutation.call({
            action: "added",
            target,
            nodes: [element]
        });
    }
});

const SyncMutationObserver = /*#__PURE__*/Object.freeze({
    __proto__: null,
    onDOMMutation
});

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
function trackElementsWithAttributes(attributeNames) {
    const hook = new Hook();
    for (const attr of attributeNames) {
        const vattr = new ElementAttributeInterceptor(attr, IElementtPrototype);
        vattr.raw.setter.onArgsObserverAdd(function (value) {
            hook.call(this, attr, value);
        });
    }
    return hook;
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
class ConstructorInterceptor extends FunctionInterceptor {
    ctorInterceptor = null;
    constructor(name, shadowPrototype) {
        super(name, shadowPrototype /* , true */); //If we intercept constructor, that means we want the output to be intercepted
    }
    setOriginal(originalFunc) {
        const ctorFunc = originalFunc;
        this.ctorInterceptor = function () {
            let result;
            switch (arguments.length) {
                case 0:
                    result = new ctorFunc();
                    break;
                case 1:
                    result = new ctorFunc(arguments[0]);
                    break;
                case 2:
                    result = new ctorFunc(arguments[0], arguments[1]);
                    break;
                case 3:
                    result = new ctorFunc(arguments[0], arguments[1], arguments[2]);
                    break;
                case 4:
                    result = new ctorFunc(arguments[0], arguments[1], arguments[2], arguments[3]);
                    break;
                case 5:
                    result = new ctorFunc(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
                    break;
                case 6:
                    result = new ctorFunc(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
                    break;
                default: throw "Unsupported case!";
            }
            return intercept(result);
        };
        return super.setOriginal(this.ctorInterceptor);
    }
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
class EventHandlerAttributeInterceptor extends AttributeInterceptor {
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
const IWindowPrototype = new DOMShadowPrototype(Window, IEventTargetPrototype, { sampleObject: window, registerOnPrototype: true });
const fetch = new FunctionInterceptor("fetch", IWindowPrototype);
new FunctionInterceptor("requestAnimationFrame", IWindowPrototype);
new FunctionInterceptor("requestIdleCallback", IWindowPrototype);
new FunctionInterceptor("setInterval", IWindowPrototype);
new FunctionInterceptor("setTimeout", IWindowPrototype);
new ConstructorInterceptor("IntersectionObserver", IWindowPrototype);
new ConstructorInterceptor("MutationObserver", IWindowPrototype);
new ConstructorInterceptor("XMLHttpRequest", IWindowPrototype);
//#region Event Handlers https://developer.mozilla.org/en-US/docs/Web/API/Window#event_handlers
new EventHandlerAttributeInterceptor("onerror", IWindowPrototype);
const ondevicemotion = new EventHandlerAttributeInterceptor("ondevicemotion", IWindowPrototype);
const ondeviceorientation = new EventHandlerAttributeInterceptor("ondeviceorientation", IWindowPrototype);
const onorientationchange = new EventHandlerAttributeInterceptor("onorientationchange", IWindowPrototype);
//#endretion

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
const IXMLHttpRequestPrototype = new DOMShadowPrototype(XMLHttpRequest, IEventTargetPrototype, { sampleObject: new XMLHttpRequest(), registerOnPrototype: true });
const open = new FunctionInterceptor("open", IXMLHttpRequestPrototype);
const send = new FunctionInterceptor("send", IXMLHttpRequestPrototype);
new AttributeInterceptor("withCredentials", IXMLHttpRequestPrototype);
const onabort$1 = new EventHandlerAttributeInterceptor("onabort", IXMLHttpRequestPrototype);
const onerror = new EventHandlerAttributeInterceptor("onerror", IXMLHttpRequestPrototype);
const onload$1 = new EventHandlerAttributeInterceptor("onload", IXMLHttpRequestPrototype);
const onloadend = new EventHandlerAttributeInterceptor("onloadend", IXMLHttpRequestPrototype);
const onloadstart$1 = new EventHandlerAttributeInterceptor("onloadstart", IXMLHttpRequestPrototype);
const onprogress$1 = new EventHandlerAttributeInterceptor("onprogress", IXMLHttpRequestPrototype);
const ontimeout = new EventHandlerAttributeInterceptor("ontimeout", IXMLHttpRequestPrototype);

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
/**
 * This is a generic event to be fired when a network request is about to happen.
 * Generally, various network api can be intercepted to provide a more unified way
 * of notifying the app about network requests.
 */
const onNetworkRequest = new Hook();
fetch.onArgsObserverAdd((input, init) => {
    let request;
    if (typeof input === "string") {
        request = {
            method: init?.method ?? "get",
            url: input,
        };
    }
    else {
        request = {
            method: input.method,
            url: input.url,
        };
    }
    onNetworkRequest.call(request);
});
//#region XHR
const XHR_REQUEST_INFO_PROP = 'requestInfo';
open.onArgsObserverAdd(function (method, url) {
    setVirtualPropertyValue(this, XHR_REQUEST_INFO_PROP, { method, url });
});
send.onArgsObserverAdd(function (_body) {
    const request = getVirtualPropertyValue(this, XHR_REQUEST_INFO_PROP);
    assert(request != null, `Unexpected situation! Request info is missing from xhr object`);
    onNetworkRequest.call(request); // assert already ensures request is not undefined
});
//#endregion
//TODO: do we care about sendBeacon as well?

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
function isEventListenerObject(func) {
    return typeof func === "object" && typeof func.handleEvent == "function";
}
function interceptEventListener(listener) {
    let funcInterceptor;
    if (isEventListenerObject(listener)) {
        funcInterceptor = interceptFunction(listener.handleEvent);
        listener.handleEvent = funcInterceptor.interceptor;
    }
    else {
        funcInterceptor = interceptFunction(listener);
    }
    return funcInterceptor;
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
const IHTMLElementtPrototype = new DOMShadowPrototype(HTMLElement, IElementtPrototype, {
    sampleObject: sampleHTMLElement,
    nodeType: document.ELEMENT_NODE
});

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
// Technically we can chose any of HTMLElement, SVGElement, or MathElement
const IGlobalEventHandlersPrototype = IHTMLElementtPrototype;
//#region global Event Handlers https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers
const onabort = new EventHandlerAttributeInterceptor("onabort", IGlobalEventHandlersPrototype);
const onanimationcancel = new EventHandlerAttributeInterceptor("onanimationcancel", IGlobalEventHandlersPrototype);
const onanimationend = new EventHandlerAttributeInterceptor("onanimationend", IGlobalEventHandlersPrototype);
const onanimationiteration = new EventHandlerAttributeInterceptor("onanimationiteration", IGlobalEventHandlersPrototype);
const onanimationstart = new EventHandlerAttributeInterceptor("onanimationstart", IGlobalEventHandlersPrototype);
const onauxclick = new EventHandlerAttributeInterceptor("onauxclick", IGlobalEventHandlersPrototype);
const onblur = new EventHandlerAttributeInterceptor("onblur", IGlobalEventHandlersPrototype);
const oncanplay = new EventHandlerAttributeInterceptor("oncanplay", IGlobalEventHandlersPrototype);
const oncanplaythrough = new EventHandlerAttributeInterceptor("oncanplaythrough", IGlobalEventHandlersPrototype);
const onchange = new EventHandlerAttributeInterceptor("onchange", IGlobalEventHandlersPrototype);
const onclick = new EventHandlerAttributeInterceptor("onclick", IGlobalEventHandlersPrototype);
const onclose = new EventHandlerAttributeInterceptor("onclose", IGlobalEventHandlersPrototype);
const oncontextmenu = new EventHandlerAttributeInterceptor("oncontextmenu", IGlobalEventHandlersPrototype);
const oncuechange = new EventHandlerAttributeInterceptor("oncuechange", IGlobalEventHandlersPrototype);
const ondblclick = new EventHandlerAttributeInterceptor("ondblclick", IGlobalEventHandlersPrototype);
const ondrag = new EventHandlerAttributeInterceptor("ondrag", IGlobalEventHandlersPrototype);
const ondragend = new EventHandlerAttributeInterceptor("ondragend", IGlobalEventHandlersPrototype);
const ondragenter = new EventHandlerAttributeInterceptor("ondragenter", IGlobalEventHandlersPrototype);
const ondragleave = new EventHandlerAttributeInterceptor("ondragleave", IGlobalEventHandlersPrototype);
const ondragover = new EventHandlerAttributeInterceptor("ondragover", IGlobalEventHandlersPrototype);
const ondragstart = new EventHandlerAttributeInterceptor("ondragstart", IGlobalEventHandlersPrototype);
const ondrop = new EventHandlerAttributeInterceptor("ondrop", IGlobalEventHandlersPrototype);
const ondurationchange = new EventHandlerAttributeInterceptor("ondurationchange", IGlobalEventHandlersPrototype);
const onemptied = new EventHandlerAttributeInterceptor("onemptied", IGlobalEventHandlersPrototype);
const onended = new EventHandlerAttributeInterceptor("onended", IGlobalEventHandlersPrototype);
const onfocus = new EventHandlerAttributeInterceptor("onfocus", IGlobalEventHandlersPrototype);
const onformdata = new EventHandlerAttributeInterceptor("onformdata", IGlobalEventHandlersPrototype);
const ongotpointercapture = new EventHandlerAttributeInterceptor("ongotpointercapture", IGlobalEventHandlersPrototype);
const oninput = new EventHandlerAttributeInterceptor("oninput", IGlobalEventHandlersPrototype);
const oninvalid = new EventHandlerAttributeInterceptor("oninvalid", IGlobalEventHandlersPrototype);
const onkeydown = new EventHandlerAttributeInterceptor("onkeydown", IGlobalEventHandlersPrototype);
const onkeypress = new EventHandlerAttributeInterceptor("onkeypress", IGlobalEventHandlersPrototype);
const onkeyup = new EventHandlerAttributeInterceptor("onkeyup", IGlobalEventHandlersPrototype);
const onload = new EventHandlerAttributeInterceptor("onload", IGlobalEventHandlersPrototype);
const onloadeddata = new EventHandlerAttributeInterceptor("onloadeddata", IGlobalEventHandlersPrototype);
const onloadedmetadata = new EventHandlerAttributeInterceptor("onloadedmetadata", IGlobalEventHandlersPrototype);
const onloadstart = new EventHandlerAttributeInterceptor("onloadstart", IGlobalEventHandlersPrototype);
const onlostpointercapture = new EventHandlerAttributeInterceptor("onlostpointercapture", IGlobalEventHandlersPrototype);
const onmousedown = new EventHandlerAttributeInterceptor("onmousedown", IGlobalEventHandlersPrototype);
const onmouseenter = new EventHandlerAttributeInterceptor("onmouseenter", IGlobalEventHandlersPrototype);
const onmouseleave = new EventHandlerAttributeInterceptor("onmouseleave", IGlobalEventHandlersPrototype);
const onmousemove = new EventHandlerAttributeInterceptor("onmousemove", IGlobalEventHandlersPrototype);
const onmouseout = new EventHandlerAttributeInterceptor("onmouseout", IGlobalEventHandlersPrototype);
const onmouseover = new EventHandlerAttributeInterceptor("onmouseover", IGlobalEventHandlersPrototype);
const onmouseup = new EventHandlerAttributeInterceptor("onmouseup", IGlobalEventHandlersPrototype);
const onpause = new EventHandlerAttributeInterceptor("onpause", IGlobalEventHandlersPrototype);
const onplay = new EventHandlerAttributeInterceptor("onplay", IGlobalEventHandlersPrototype);
const onplaying = new EventHandlerAttributeInterceptor("onplaying", IGlobalEventHandlersPrototype);
const onpointercancel = new EventHandlerAttributeInterceptor("onpointercancel", IGlobalEventHandlersPrototype);
const onpointerdown = new EventHandlerAttributeInterceptor("onpointerdown", IGlobalEventHandlersPrototype);
const onpointerenter = new EventHandlerAttributeInterceptor("onpointerenter", IGlobalEventHandlersPrototype);
const onpointerleave = new EventHandlerAttributeInterceptor("onpointerleave", IGlobalEventHandlersPrototype);
const onpointermove = new EventHandlerAttributeInterceptor("onpointermove", IGlobalEventHandlersPrototype);
const onpointerout = new EventHandlerAttributeInterceptor("onpointerout", IGlobalEventHandlersPrototype);
const onpointerover = new EventHandlerAttributeInterceptor("onpointerover", IGlobalEventHandlersPrototype);
const onpointerup = new EventHandlerAttributeInterceptor("onpointerup", IGlobalEventHandlersPrototype);
const onprogress = new EventHandlerAttributeInterceptor("onprogress", IGlobalEventHandlersPrototype);
const onratechange = new EventHandlerAttributeInterceptor("onratechange", IGlobalEventHandlersPrototype);
const onreset = new EventHandlerAttributeInterceptor("onreset", IGlobalEventHandlersPrototype);
const onresize = new EventHandlerAttributeInterceptor("onresize", IGlobalEventHandlersPrototype);
const onscroll = new EventHandlerAttributeInterceptor("onscroll", IGlobalEventHandlersPrototype);
const onsecuritypolicyviolation = new EventHandlerAttributeInterceptor("onsecuritypolicyviolation", IGlobalEventHandlersPrototype);
const onseeked = new EventHandlerAttributeInterceptor("onseeked", IGlobalEventHandlersPrototype);
const onseeking = new EventHandlerAttributeInterceptor("onseeking", IGlobalEventHandlersPrototype);
const onselect = new EventHandlerAttributeInterceptor("onselect", IGlobalEventHandlersPrototype);
const onselectionchange = new EventHandlerAttributeInterceptor("onselectionchange", IGlobalEventHandlersPrototype);
const onselectstart = new EventHandlerAttributeInterceptor("onselectstart", IGlobalEventHandlersPrototype);
const onslotchange = new EventHandlerAttributeInterceptor("onslotchange", IGlobalEventHandlersPrototype);
const onstalled = new EventHandlerAttributeInterceptor("onstalled", IGlobalEventHandlersPrototype);
const onsubmit = new EventHandlerAttributeInterceptor("onsubmit", IGlobalEventHandlersPrototype);
const onsuspend = new EventHandlerAttributeInterceptor("onsuspend", IGlobalEventHandlersPrototype);
const ontimeupdate = new EventHandlerAttributeInterceptor("ontimeupdate", IGlobalEventHandlersPrototype);
const ontoggle = new EventHandlerAttributeInterceptor("ontoggle", IGlobalEventHandlersPrototype);
const ontouchcancel = new EventHandlerAttributeInterceptor("ontouchcancel", IGlobalEventHandlersPrototype);
const ontouchend = new EventHandlerAttributeInterceptor("ontouchend", IGlobalEventHandlersPrototype);
const ontouchmove = new EventHandlerAttributeInterceptor("ontouchmove", IGlobalEventHandlersPrototype);
const ontouchstart = new EventHandlerAttributeInterceptor("ontouchstart", IGlobalEventHandlersPrototype);
const ontransitioncancel = new EventHandlerAttributeInterceptor("ontransitioncancel", IGlobalEventHandlersPrototype);
const ontransitionend = new EventHandlerAttributeInterceptor("ontransitionend", IGlobalEventHandlersPrototype);
const ontransitionrun = new EventHandlerAttributeInterceptor("ontransitionrun", IGlobalEventHandlersPrototype);
const ontransitionstart = new EventHandlerAttributeInterceptor("ontransitionstart", IGlobalEventHandlersPrototype);
const onvolumechange = new EventHandlerAttributeInterceptor("onvolumechange", IGlobalEventHandlersPrototype);
const onwaiting = new EventHandlerAttributeInterceptor("onwaiting", IGlobalEventHandlersPrototype);
const onwebkitanimationend = new EventHandlerAttributeInterceptor("onwebkitanimationend", IGlobalEventHandlersPrototype);
const onwebkitanimationiteration = new EventHandlerAttributeInterceptor("onwebkitanimationiteration", IGlobalEventHandlersPrototype);
const onwebkitanimationstart = new EventHandlerAttributeInterceptor("onwebkitanimationstart", IGlobalEventHandlersPrototype);
const onwebkittransitionend = new EventHandlerAttributeInterceptor("onwebkittransitionend", IGlobalEventHandlersPrototype);
const onwheel = new EventHandlerAttributeInterceptor("onwheel", IGlobalEventHandlersPrototype);
const onafterprint = new EventHandlerAttributeInterceptor("onafterprint", IGlobalEventHandlersPrototype);
const onbeforeprint = new EventHandlerAttributeInterceptor("onbeforeprint", IGlobalEventHandlersPrototype);
const onbeforeunload = new EventHandlerAttributeInterceptor("onbeforeunload", IGlobalEventHandlersPrototype);
const ongamepadconnected = new EventHandlerAttributeInterceptor("ongamepadconnected", IGlobalEventHandlersPrototype);
const ongamepaddisconnected = new EventHandlerAttributeInterceptor("ongamepaddisconnected", IGlobalEventHandlersPrototype);
const onhashchange = new EventHandlerAttributeInterceptor("onhashchange", IGlobalEventHandlersPrototype);
const onlanguagechange = new EventHandlerAttributeInterceptor("onlanguagechange", IGlobalEventHandlersPrototype);
const onmessage = new EventHandlerAttributeInterceptor("onmessage", IGlobalEventHandlersPrototype);
const onmessageerror = new EventHandlerAttributeInterceptor("onmessageerror", IGlobalEventHandlersPrototype);
const onoffline = new EventHandlerAttributeInterceptor("onoffline", IGlobalEventHandlersPrototype);
const ononline = new EventHandlerAttributeInterceptor("ononline", IGlobalEventHandlersPrototype);
const onpagehide = new EventHandlerAttributeInterceptor("onpagehide", IGlobalEventHandlersPrototype);
const onpageshow = new EventHandlerAttributeInterceptor("onpageshow", IGlobalEventHandlersPrototype);
const onpopstate = new EventHandlerAttributeInterceptor("onpopstate", IGlobalEventHandlersPrototype);
const onrejectionhandled = new EventHandlerAttributeInterceptor("onrejectionhandled", IGlobalEventHandlersPrototype);
const onstorage = new EventHandlerAttributeInterceptor("onstorage", IGlobalEventHandlersPrototype);
const onunhandledrejection = new EventHandlerAttributeInterceptor("onunhandledrejection", IGlobalEventHandlersPrototype);
const onunload = new EventHandlerAttributeInterceptor("onunload", IGlobalEventHandlersPrototype);
//#endretion

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
const PromisePrototype = Object.getPrototypeOf(Promise.resolve());
const IPromisePrototype = new ShadowPrototype(PromisePrototype, null);
const then = new FunctionInterceptor("then", IPromisePrototype);
const Catch = new FunctionInterceptor("catch", IPromisePrototype);
registerShadowPrototype(PromisePrototype, IPromisePrototype);

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
const IGlobalThisPrototype = new ShadowPrototype(globalScope, null);
const setInterval = new FunctionInterceptor("setInterval", IGlobalThisPrototype);
const setTimeout = new FunctionInterceptor("setTimeout", IGlobalThisPrototype);

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
function initFlowletTrackers(flowletManager) {
    const IS_SETUP_PROP_NAME = `__isSetup`;
    function wrap(listener) {
        if (!listener) {
            return listener;
        }
        const currentFLowlet = flowletManager.top();
        if (!currentFLowlet) {
            return listener;
        }
        const funcInterceptor = interceptEventListener(listener);
        if (!funcInterceptor[IS_SETUP_PROP_NAME]) {
            funcInterceptor[IS_SETUP_PROP_NAME] = true;
            funcInterceptor.onArgsObserverAdd(() => {
                flowletManager.push(currentFLowlet);
            });
            funcInterceptor.onValueObserverAdd(() => {
                flowletManager.pop(currentFLowlet);
            });
            // funcInterceptor.setCustom(function (this: any) {
            //   const handler = funcInterceptor.getOriginal();
            //   if (flowletManager.top() === currentFLowlet) {
            //     return handler.apply(this, <any>arguments);
            //   }
            //   let res;
            //   try {
            //     flowletManager.push(currentFLowlet);
            //     res = handler.apply(this, <any>arguments);
            //   } finally {
            //     flowletManager.pop(currentFLowlet);
            //   }
            //   return res;
            // })
        }
        return isEventListenerObject(listener) ? listener : funcInterceptor.interceptor;
    }
    function unwrap(listener) {
        if (listener && !isEventListenerObject(listener) && isIntercepted(listener)) {
            const funcInterceptor = interceptEventListener(listener);
            return funcInterceptor.getOriginal();
        }
        return listener;
    }
    for (const eventHandler of [
        ondevicemotion,
        ondeviceorientation,
        onorientationchange,
        onabort,
        onanimationcancel,
        onanimationend,
        onanimationiteration,
        onanimationstart,
        onauxclick,
        onblur,
        oncanplay,
        oncanplaythrough,
        onchange,
        onclick,
        onclose,
        oncontextmenu,
        oncuechange,
        ondblclick,
        ondrag,
        ondragend,
        ondragenter,
        ondragleave,
        ondragover,
        ondragstart,
        ondrop,
        ondurationchange,
        onemptied,
        onended,
        onfocus,
        onformdata,
        ongotpointercapture,
        oninput,
        oninvalid,
        onkeydown,
        onkeypress,
        onkeyup,
        onload,
        onloadeddata,
        onloadedmetadata,
        onloadstart,
        onlostpointercapture,
        onmousedown,
        onmouseenter,
        onmouseleave,
        onmousemove,
        onmouseout,
        onmouseover,
        onmouseup,
        onpause,
        onplay,
        onplaying,
        onpointercancel,
        onpointerdown,
        onpointerenter,
        onpointerleave,
        onpointermove,
        onpointerout,
        onpointerover,
        onpointerup,
        onprogress,
        onratechange,
        onreset,
        onresize,
        onscroll,
        onsecuritypolicyviolation,
        onseeked,
        onseeking,
        onselect,
        onselectionchange,
        onselectstart,
        onslotchange,
        onstalled,
        onsubmit,
        onsuspend,
        ontimeupdate,
        ontoggle,
        ontouchcancel,
        ontouchend,
        ontouchmove,
        ontouchstart,
        ontransitioncancel,
        ontransitionend,
        ontransitionrun,
        ontransitionstart,
        onvolumechange,
        onwaiting,
        onwebkitanimationend,
        onwebkitanimationiteration,
        onwebkitanimationstart,
        onwebkittransitionend,
        onwheel,
        onafterprint,
        onbeforeprint,
        onbeforeunload,
        ongamepadconnected,
        ongamepaddisconnected,
        onhashchange,
        onlanguagechange,
        onmessage,
        onmessageerror,
        onoffline,
        ononline,
        onpagehide,
        onpageshow,
        onpopstate,
        onrejectionhandled,
        onstorage,
        onunhandledrejection,
        onunload,
        // IWorker.onmessage,
        // IWorker.onmessageerror,
        // IWorker.onerror,
        onabort$1,
        onerror,
        onload$1,
        onloadend,
        onloadstart$1,
        onprogress$1,
        ontimeout,
    ]) {
        eventHandler.setter.onArgsMapperAdd(function (args) {
            const func = args[0];
            args[0] = wrap(func);
            return args;
        });
    }
    for (const fi of [
        setTimeout,
        setInterval
    ]) {
        fi.onArgsMapperAdd(args => {
            let handler = args[0];
            if (typeof handler === "string") {
                handler = new Function(handler);
            }
            args[0] = wrap(handler);
            return args;
        });
    }
    then.onArgsMapperAdd(args => {
        args[0] = wrap(args[0]);
        args[1] = wrap(args[1]);
        return args;
    });
    Catch.onArgsMapperAdd(args => {
        args[0] = wrap(args[0]);
        return args;
    });
    addEventListener.onArgsMapperAdd(args => {
        args[1] = wrap(args[1]);
        return args;
    });
    removeEventListener.onArgsMapperAdd(args => {
        args[1] = unwrap(args[1]);
        return args;
    });
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
class Flowlet {
    name;
    parent;
    constructor(name, parent) {
        this.name = name;
        this.parent = parent;
    }
    fullName() {
        return `${this.parent?.fullName() ?? ""}/${this.name}`;
    }
    fork(name) {
        return new Flowlet(name, this);
    }
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
class FlowletManager {
    flowletStack = [];
    top() {
        const last = this.flowletStack.length - 1;
        return last >= 0 ? this.flowletStack[last] : null;
    }
    push(flowlet) {
        this.flowletStack.push(flowlet);
        this.onPush.call(flowlet);
        return flowlet;
    }
    onPush = new Hook();
    /**
     * pop and return top of stack
     * @param flowlet if passed, asserts top matches the input
     * @returns top of the stack or null
     */
    pop(flowlet) {
        let currTop = this.top();
        __DEV__ && assert(!flowlet || currTop === flowlet, `Incompatible top of the stack`);
        this.flowletStack.pop();
        this.onPop.call(currTop);
        return currTop;
    }
    onPop = new Hook();
}

export { Flowlet, FlowletManager, SyncMutationObserver, getVirtualPropertyValue, initFlowletTrackers, onNetworkRequest, setVirtualPropertyValue, trackElementsWithAttributes };
