import { bloomFilter, allBloomFilters } from "../bloomFilter.js";
import { checkUsernameInSet, addUsernameToSet } from "../redisWorker/redisService.js";
import {setUserDisplayName} from "../utility.js";

async function checkInBloomFilter(key) {
  try {
    const inRedisSet = await checkUsernameInSet(key);
    if (inRedisSet) {
      console.log(`Cache hit for key: ${key}`);
      return true;
    }
    const inActiveFilter = bloomFilter.contains(key);
    const inOldFilters = allBloomFilters.some(bf => bf.filter.contains(key));
    const inBloomFilter = inActiveFilter || inOldFilters;
    
    if (inBloomFilter) {
        await addUsernameToSet(key);
    }
    
    console.log(`Checked bloom filters for key: ${key}, found: ${inBloomFilter}`);
    return inBloomFilter;
  } catch (error) {
    console.error(`Error checking bloom filter for key ${key}:`, error);
    return false;
  }
}

function checkUserNameFormat(name)
{
  if (!name || typeof name !== 'string') {
    return "The name must be a non-empty string.";
  }

  const sanitized = name.trim();
  if (sanitized.length < 6 || sanitized.length > 20) {
    return "The name must be between 6 and 20 characters long.";
  }
  if (/^\d+$/.test(sanitized)) {
    return "The name cannot contain only numbers.";
  }

  if (/^\d/.test(sanitized)) {
    return "The name cannot start with a number.";
  }
  if (/^[a-zA-Z]+$/.test(sanitized)) {
    return sanitized;
  }

  if (/^[a-zA-Z0-9]+$/.test(sanitized)) {
    return sanitized;
  }

  if (/^[a-zA-Z0-9._]+$/.test(sanitized)) {
    return sanitized;
  }

  return "The name must contain only alphabetic characters, numbers, underscores, or dots.";
}

async function suggestUserName(name) {
    const normalized = checkUserNameFormat(name);
    if (typeof normalized === 'string' && normalized !== name) {
        return normalized;
    }

    const baseName = name.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    if (!baseName) {
        return 'user' + Math.random().toString(36).substr(2, 6);
    }

    const elegantSuffixes = ['pro', 'elite', 'prime', 'zen', 'core', 'sage'];
    const classyPrefixes = ['the', 'neo', 'ultra', 'alpha', 'meta'];
    const candidates = [];
    candidates.push(baseName);
    for (let i = 1; i <= 20; i++) {
        candidates.push(baseName + (Math.floor(Math.random() * 99) + 1));
    }
    elegantSuffixes.forEach(suf => candidates.push(baseName + suf));
    classyPrefixes.forEach(pre => candidates.push(pre + baseName));
    candidates.push(baseName + Math.random().toString(36).substr(2, 4));
    for (const candidate of candidates) {
        const exists = await checkInBloomFilter(candidate);
        if (!exists) {
            return candidate;
        }
    }
    return 'user' + Math.random().toString(36).substr(2, 8);
}

async function addNameToBloomRedisDB(name, uid) {
    const sanitized = checkUserNameFormat(name);
    if (typeof sanitized === 'string') {
        bloomFilter.add(sanitized.toLowerCase());
        await addUsernameToSet(sanitized.toLowerCase());
        setUserDisplayName(uid, sanitized);
        console.log(`Added name to bloom filter: ${sanitized.toLowerCase()}`);
        return true;
    } else {
        console.error(`Invalid name format, cannot add to bloom filter: ${name}`);
        return false;
    }
}

async function checkUsernameRequest(name, req, res)
{
  const sanitized = checkUserNameFormat(name);
  console.log("Sanitized Name:", sanitized);
  if (sanitized !== name) {
    return res.status(400).json({ available: false, message: sanitized });
  }
  const exists = await checkInBloomFilter(sanitized.toLowerCase());
  if (exists) {
    const userNameSuggested = await suggestUserName(sanitized);
    console.log("Suggested Name:", userNameSuggested);
    return res.status(200).json({ available: false, message: "Username is already taken.", suggestion: userNameSuggested });
  } else {
    return res.status(200).json({ available: true, message: "Username is available!" });
  }
}

export {checkInBloomFilter, checkUserNameFormat, suggestUserName, addNameToBloomRedisDB, checkUsernameRequest}