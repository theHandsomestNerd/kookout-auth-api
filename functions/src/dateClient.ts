const getTomorrow = () => {
    const tomorrow = new Date() // The Date object returns today's timestamp

    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    tomorrow.setUTCHours(0)
    tomorrow.setUTCMinutes(0)
    tomorrow.setUTCSeconds(0)
    tomorrow.setUTCMilliseconds(0)
    return tomorrow
}

const getToday = () => {
    const today = new Date() // The Date object returns today's timestamp

    today.setUTCHours(0)
    today.setUTCMinutes(0)
    today.setUTCSeconds(0)
    today.setUTCMilliseconds(0)
    return today
}

const getMonth = (month: number) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    return months[month]
}

const convertToISO = (dateString:string)=>{
    const convertedDate = dateString.split("/")

    return new Date(`${convertedDate[2]}-${convertedDate[0]}-${convertedDate[1]}`)
}

const getFriendlyDate = (dateString: string)=>{
    const oldFormat = new Date(dateString).toLocaleDateString("en-us", { weekday:"long", year:"numeric", month:"long", day:"numeric"})

    console.log("Getting friendly date", dateString, oldFormat)
    return oldFormat
}

export default {getTomorrow, getMonth, convertToISO, getFriendlyDate, getToday}