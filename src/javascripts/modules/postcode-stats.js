/* global fetch, CustomEvent */
import utils from '../utils'

function numberWithCommas (x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function readableNumber (v) {
  const n = parseFloat(v)
  return numberWithCommas(n.toFixed(2))
}

function PostcodeStats ($form, $resultsContainer) {
  this.$form = $form
  this.$resultsContainer = $resultsContainer
}

PostcodeStats.prototype.init = function () {
  this.selectedPostcodes = []
  this.observers = []

  // grab elements from page
  this.$input = this.$form.querySelector('.postcode-select-input')
  this.$btn = this.$form.querySelector('[data-module="postcode-select-btn"]')
  this.$postcodeSummariesContainer = this.$resultsContainer.querySelector('.app-postcode-results')
  this.$resultTemplate = document.getElementById('result-template')

  this.$selectedList = this.$resultsContainer.querySelector('.app-postcode-selected__list')
  this.$listItemTemplate = document.getElementById('selected-template')

  // check for already selected
  const urlParams = (new URL(document.location)).searchParams
  if (urlParams.has('selected_postcodes')) {
    this.selectedPostcodes = urlParams.getAll('selected_postcodes')
    console.log(this.selectedPostcodes)
  }

  const boundSubmitHandler = this.submitHandler.bind(this)
  this.$form.addEventListener('submit', boundSubmitHandler)
  return this
}

PostcodeStats.prototype.addObserver = function ($el) {
  this.observers.push($el)
}

PostcodeStats.prototype.removeObserver = function ($el) {
  utils.removeItemOnce(this.observers, $el)
}

PostcodeStats.prototype.addSelectedItem = function (postcode) {
  const $item = this.$listItemTemplate.content.cloneNode(true)

  const $label = $item.querySelector('.app-selected-item__label')
  $label.textContent = postcode
  const $link = $item.querySelector('.app-selected-item__remove')
  $link.href = this.makeRemoveURL(postcode)

  this.$selectedList.appendChild($item)
}

// checks if there are any postcodes currently selected
PostcodeStats.prototype.checkSelection = function () {
  if (this.selectedPostcodes.length > 0) {
    this.showContainer()
  } else {
    this.hideContainer()
  }
}

PostcodeStats.prototype.createResult = function (postcode, stats) {
  const $result = this.$resultTemplate.content.cloneNode(true)

  // get all elements to add stats
  const $postcode = $result.querySelector('[data-stats="postcode_area"]')
  $postcode.textContent = postcode
  const $count = $result.querySelector('[data-stats="count"]')
  $count.textContent = stats.count
  const $avgVal = $result.querySelector('[data-stats="avg-value"]')
  $avgVal.textContent = readableNumber(stats.avg.value)
  const $avgLTT = $result.querySelector('[data-stats="avg-ltt-basic"]')
  $avgLTT.textContent = readableNumber(stats.avg.ltt_amount.basic)
  const $avgLTTHigher = $result.querySelector('[data-stats="avg-ltt-higher"]')
  $avgLTTHigher.textContent = readableNumber(stats.avg.ltt_amount.higher)
  const $maxVal = $result.querySelector('[data-stats="max-value"]')
  $maxVal.textContent = readableNumber(stats.max.value)
  const $maxLTT = $result.querySelector('[data-stats="max-ltt-basic"]')
  $maxLTT.textContent = readableNumber(stats.max.ltt_amount.basic)
  const $maxLTTHigher = $result.querySelector('[data-stats="max-ltt-higher"]')
  $maxLTTHigher.textContent = readableNumber(stats.max.ltt_amount.higher)
  const $minVal = $result.querySelector('[data-stats="min-value"]')
  $minVal.textContent = readableNumber(stats.min.value)
  const $minLTT = $result.querySelector('[data-stats="min-ltt-basic"]')
  $minLTT.textContent = readableNumber(stats.min.ltt_amount.basic)
  const $minLTTHigher = $result.querySelector('[data-stats="min-ltt-higher"]')
  $minLTTHigher.textContent = readableNumber(stats.min.ltt_amount.higher)

  // add to a grid element and then container
  const $wrapper = utils.createElement('div', '', ['col-lg-4'])
  $wrapper.appendChild($result)
  this.$postcodeSummariesContainer.appendChild($wrapper)
}

PostcodeStats.prototype.fetchStats = function (postcode) {
  const that = this
  fetch(`/prototypes/postcode-stats/${postcode}`)
    .then(response => response.json())
    .then(function (data) {
      that.selectedPostcodes.push(postcode)
      that.createResult(postcode, data[postcode])
      that.addSelectedItem(postcode)
      that.checkSelection()
      that.updateURL()
      console.log(that.makeRemoveURL(postcode))
    })
}

PostcodeStats.prototype.hideContainer = function () {
  this.$resultsContainer.classList.add('app-postcode-stat-results--none')
}

PostcodeStats.prototype.makeRemoveURL = function (postcode) {
  let url = `/prototypes/en/by-post-code/remove/${postcode}?`
  this.selectedPostcodes.forEach(function (selection, idx) {
    if (idx > 0) {
      url += '&'
    }
    url += `selected_postcodes=${selection}`
  })
  return url
}

PostcodeStats.prototype.showContainer = function () {
  this.$resultsContainer.classList.remove('app-postcode-stat-results--none')
}

PostcodeStats.prototype.submitHandler = function (e) {
  e.preventDefault()
  const selection = this.$input.value
  if (!this.selectedPostcodes.includes(selection)) {
    this.fetchStats(selection)
    // trigger event - to do change name to dispatch
    this.triggerNewSelectionEvent(selection)
  } else {
    // handle better
    console.log(`${selection} already selected`)
  }
}

PostcodeStats.prototype.triggerNewSelectionEvent = function (postcode) {
  if (this.observers.length) {
    const selectionEvent = new CustomEvent('newSelection', { detail: { postcode: postcode } })
    this.observers.forEach(function ($el) {
      $el.dispatchEvent(selectionEvent)
    })
  }
}

PostcodeStats.prototype.updateURL = function () {
  const urlParams = (new URL(document.location)).searchParams

  urlParams.delete('selected_postcodes')
  this.selectedPostcodes.forEach(postcode => urlParams.append('selected_postcodes', postcode))
  const newURL = window.location.pathname + '?' + urlParams.toString() + window.location.hash
  // add entry to history, does not fire event so need to call setControls
  window.history.pushState({}, '', newURL)
}

export default PostcodeStats
