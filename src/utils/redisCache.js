import redis from './redis.js';

/** 
* @param {string} key 
* @param {any} data 
* @param {number} ttl 
*/

export const setCache=async(key,data,ttl)=>{
    try{
        await redis.set(key,JSON.stringify(data),"EX",ttl);
        console.log(`Cache key for key :${key}`)
    }
    catch(error){
        console.error(`Error setting cache for key ${key}`)
    }
}

/**
 * @param {string} key
 * @returns {any|null}
 */
export const getCache=async(key)=>{
    try{
        const data=await redis.get(key);
        if(data){
            console.log("Cache hit")
            return JSON.parse(data);
    }
    console.log(`Cache miss for key`)
    return null;
}
catch(error){
    console.error(`Error getting cache`);
    return null;
}
}

/**
 * @param {string} key
 */
export const invalidateCache=async(key)=>{
    try{
        await redis.del(key);
        console.log(`Cache invalidated for key ${key}`)
    }
    catch(error){
        console.error(`Error invalidating cache for key ${key}`)
    }
};

