/*
Modified version from raineorshine/memrise-export.js
Export Memrise course words to CSV.
1. Log into memrise.com
2. Navigate to course home page (e.g. http://www.memrise.com/course/335725/comprehensive-german-duolingo-vocabulary/)
3. Open Developer Console
4. Paste below script and hit enter
5. After all urls have been fetched, copy final word list into spreadsheet.
*/

(() => {
  function getWords(courseId, level) {
    const url = `https://www.memrise.com/ajax/session/?course_id=${courseId}&level_index=${level}&session_slug=preview`
    console.log('Fetching words from ' + url)
    return fetch(url, { credentials: 'same-origin' })
    // parse response
    .then(res => {
      return res.status === 200
      ? res.json()
      // map results
      .then(data => {
        return data.learnables.map(row => {
          return {
            original: row.item.value,
            translation: row.definition.value,
            partOfSpeech: data.screens[parseInt(row.learnable_id)][1].attributes[0] ? data.screens[parseInt(row.learnable_id)][1].attributes[0].value : "",
            pronunciation: data.screens[parseInt(row.learnable_id)][1].attributes[1] ? data.screens[parseInt(row.learnable_id)][1].attributes[1].value : ""
          }
        })
      })
      .then(words => {
        return getWords(courseId, level + 1)
        .then(words.concat.bind(words))
      })
      : []
    })
    .catch(err => {
      console.error(err)
      return []
    })
  }
  
  // fetch
  const start = 1
  const courseId = location.href.slice(30).match(/\d+/)[0] 
  getWords(courseId, start)
  // format as csv
  .then(words => {
    console.log(words.length + ' words')
    return words.map(word => {
      return word.original+'-'+word.translation+'-'+word.pronunciation+'-'+word.partOfSpeech+'\n'
    }).join('')
  })
  // print
  .then(console.log)
  
})()