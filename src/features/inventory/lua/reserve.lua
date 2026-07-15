local key = KEYS[1]
local requestedQuantity = tonumber(ARGV[1])
local available = tonumber(redis.call("GET", key))

if available == nil then
    return -1
end
if available >= requestedQuantity then
    redis.call("DECRBY", key, requestedQuantity)
    return available - requestedQuantity
else
    return -2
end