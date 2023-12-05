const fs = require("fs")

//returns file content as string
function readFile(path) {
	return fs.readFileSync(path, { encoding: 'utf8', flag: 'r' })
}

//return object containing list name and array of list values
function matchList(input, listName) {
	const match = input.match(`${listName}: (\\d+ ?)+`)

	const split = match[0].split(": ")

	if (!match) {
		return {
			name: listName,
			entries: []
		}
	}

	return {
		name: listName,
		entries: split[1].split(" ").map(x => parseInt(x))
	}
}

//return object containing map name and array of map values
function matchMap(input, mapName) {
	const match = input.match(`${mapName}:(\\s+(\\d+ ?)+)+`)

	if (!match) {
		return {
			name: mapName,
			entries: []
		}
	}

	const split = match[0].split("\n")

	return {
		name: mapName,
		entries: split.splice(1).map(line => {
			const numStr = line.split(" ")
			return {
				destinationRangeStart: parseInt(numStr[0]),
				sourceRangeStart: parseInt(numStr[1]),
				rangeLength: parseInt(numStr[2])
			}
		})
	}
}

//chage if range a1 to a2 contains value
function contains(a1, a2, value) {
	return value >= a1 && value <= a2
}

//look up desination in map using value as source start
function lookup(map, value) {
	const entry = map.entries.find(entry =>
		contains(entry.sourceRangeStart, entry.sourceRangeStart + entry.rangeLength - 1, value)
	)

	return entry
		? (value - entry.sourceRangeStart) + entry.destinationRangeStart
		: value
}

//read input
const input = readFile("input.txt")

//get the seed list and maps
const seedList = matchList(input, "seeds")
const maps = {
	"seed-to-soil map": matchMap(input, "seed-to-soil map"),
	"soil-to-fertilizer map": matchMap(input, "soil-to-fertilizer map"),
	"fertilizer-to-water map": matchMap(input, "fertilizer-to-water map"),
	"water-to-light map": matchMap(input, "water-to-light map"),
	"light-to-temperature map": matchMap(input, "light-to-temperature map"),
	"temperature-to-humidity map": matchMap(input, "temperature-to-humidity map"),
	"humidity-to-location map": matchMap(input, "humidity-to-location map")
}

//map seed list to seed ranges
const seedRanges = []
for (let i = 0; i < seedList.entries.length; i += 2) {
	seedRanges.push({
		start: seedList.entries[i],
		//range: seedList.entries[i + 1],
		end: seedList.entries[i] + seedList.entries[i + 1] - 1
	})
}

//find smallest location value
let smallestLocationValue = Number.MAX_SAFE_INTEGER
seedRanges.forEach(range => {
	for (let i = range.start; i <= range.end; i++) {
		let value = i
		for (const mapName in maps) {
			value = lookup(maps[mapName], value)
		}

		value < smallestLocationValue && (smallestLocationValue = value)
	}
})

console.log(smallestLocationValue)
