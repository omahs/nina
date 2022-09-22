import * as encrypt from './encrypt'
import * as web3 from './web3'
import * as imageManager from './imageManager'
import MD5 from "crypto-js/md5";

const dateConverter = (date) => {
  var a = new Date(typeof date === 'object' ? date.toNumber() * 1000 : date)
  var months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  var year = a.getFullYear()
  var month = months[a.getMonth()]
  var date = a.getDate()
  var hour = a.getHours().toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  })
  var min = a.getMinutes().toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  })
  var sec = a.getSeconds().toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  })
  var time =
    year + ' ' + month + '/' + date + ' ' + hour + ':' + min + ':' + sec
  return time
}

const arrayMove = (arr, old_index, new_index) => {
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1
    while (k--) {
      arr.push(undefined)
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0])
}

const formatPlaceholder = (placeholder) => {
  return placeholder
    .match(/([A-Z0-9]?[^A-Z0-9]*)/g)
    .slice(0, -1)
    .join(' ')
    .toUpperCase()
}

const formatDuration = (duration) => {
  let sec_num = parseInt(duration, 10)
  let hours = Math.floor(sec_num / 3600)
  let minutes = Math.floor((sec_num - hours * 3600) / 60)
  let seconds = sec_num - hours * 3600 - minutes * 60

  if (hours > 0) {
    minutes += hours * 60
  }
  if (minutes < 10) {
    minutes = '0' + minutes
  }
  if (seconds < 10) {
    seconds = '0' + seconds
  }
  return minutes + ':' + seconds
}

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const shuffle = (array) => {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}


const getMd5FileHash = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
  
    reader.onload = (e => {
      const hash = MD5(e.target.result)
      resolve(hash.toString())
    })
    reader.onerror = (e => reject(e))
    reader.onabort = (e => reject(e))
    reader.readAsBinaryString(file)
  })
}

export {
  arrayMove,
  dateConverter,
  formatDuration,
  formatPlaceholder,
  imageManager,
  sleep,
  encrypt,
  web3,
  shuffle,
  getMd5FileHash
}
