/* global fetch */
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

  // grab elements from page
  this.$input = this.$form.querySelector('.postcode-select-input')
  this.$btn = this.$form.querySelector('[data-module="postcode-select-btn"]')
  this.$postcodeSummariesContainer = this.$resultsContainer.querySelector('.app-postcode-results')
  this.$resultTemplate = document.getElementById('result-template')

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
  const $avgLTT = $result.querySelector('[data-stats="avg-ltt"]')
  $avgLTT.textContent = readableNumber(stats.avg.ltt_amount)
  const $maxVal = $result.querySelector('[data-stats="max-value"]')
  $maxVal.textContent = readableNumber(stats.max.value)
  const $maxLTT = $result.querySelector('[data-stats="max-ltt"]')
  $maxLTT.textContent = readableNumber(stats.max.ltt_amount)
  const $minVal = $result.querySelector('[data-stats="min-value"]')
  $minVal.textContent = readableNumber(stats.min.value)
  const $minLTT = $result.querySelector('[data-stats="min-ltt"]')
  $minLTT.textContent = readableNumber(stats.min.ltt_amount)

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
      that.checkSelection()
      that.updateURL()
    })
}

PostcodeStats.prototype.hideContainer = function () {
  this.$resultsContainer.classList.add('app-postcode-stat-results--none')
}

PostcodeStats.prototype.showContainer = function () {
  this.$resultsContainer.classList.remove('app-postcode-stat-results--none')
}

PostcodeStats.prototype.submitHandler = function (e) {
  e.preventDefault()
  const selection = this.$input.value
  if (!this.selectedPostcodes.includes(selection)) {
    this.fetchStats(selection)
  } else {
    // handle better
    console.log(`${selection} already selected`)
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
