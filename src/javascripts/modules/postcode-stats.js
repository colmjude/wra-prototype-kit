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
  this.$input = this.$form.querySelector('.postcode-select-input')
  this.$btn = this.$form.querySelector('[data-module="postcode-select-btn"]')
  this.$postcodeSummariesContainer = this.$resultsContainer.querySelector('.app-postcode-results')
  this.$resultTemplate = document.getElementById('result-template')

  const boundSubmitHandler = this.submitHandler.bind(this)
  this.$form.addEventListener('submit', boundSubmitHandler)
  return this
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
      that.createResult(postcode, data[postcode])
    })
}

PostcodeStats.prototype.submitHandler = function (e) {
  e.preventDefault()
  this.fetchStats(this.$input.value)
}

export default PostcodeStats
