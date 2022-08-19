/* global fetch, CustomEvent */
import utils from '../utils'

function numberWithCommas (x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function readableNumber (v) {
  const n = parseFloat(v)
  const d2 = n.toFixed(2)
  // use modulus to strip trailing 0s if whole number
  if (n % 1 === 0) {
    return numberWithCommas(parseInt(d2))
  }
  return numberWithCommas(d2)
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

  this.$selectedList = document.querySelector('.app-postcode-selected__list')
  this.$selectedListContainer = this.$selectedList.closest('.app-postcode-selected')
  this.$listItemTemplate = document.getElementById('selected-template')

  this.$aggregateSummaryContainer = document.querySelector('.app-aggregate-summary')
  this.$aggregateSummaryTemplate = document.getElementById('aggregate-template')

  // check for already selected
  const urlParams = (new URL(document.location)).searchParams
  if (urlParams.has('selected_postcodes')) {
    this.selectedPostcodes = urlParams.getAll('selected_postcodes')
    console.log(this.selectedPostcodes)
  }

  // listen for new selections
  const boundSubmitHandler = this.submitHandler.bind(this)
  this.$form.addEventListener('submit', boundSubmitHandler)
  // listen for new selections via other sources (e.g. map)
  this.$form.addEventListener('newSelection', function (e) {
    const newPostcode = e.detail.postcode
    console.log('new selection made via the map', newPostcode)
    this.newSelection(newPostcode)
  }.bind(this))

  // listen for removing selections
  const boundRemoveHandler = this.removeHandler.bind(this)
  this.$selectedList.addEventListener('click', boundRemoveHandler)

  return this
}

PostcodeStats.prototype.addObserver = function ($el) {
  this.observers.push($el)
}

PostcodeStats.prototype.removeObserver = function ($el) {
  utils.removeItemOnce(this.observers, $el)
}

PostcodeStats.prototype.addSelectedItem = function (postcode) {
  const $itemFragment = this.$listItemTemplate.content.cloneNode(true)

  $itemFragment.querySelector('.app-selected-item').dataset.postcode = postcode

  const $label = $itemFragment.querySelector('.app-selected-item__label')
  $label.textContent = postcode
  const $link = $itemFragment.querySelector('.app-selected-item__remove')
  $link.href = this.makeRemoveURL(postcode)

  this.$selectedList.appendChild($itemFragment)
}

// checks if there are any postcodes currently selected
PostcodeStats.prototype.checkSelection = function () {
  if (this.selectedPostcodes.length > 0) {
    this.showContainers()
  } else {
    this.hideContainers()
  }
}

PostcodeStats.prototype.createResult = function (postcode, stats) {
  const $result = this.$resultTemplate.content.cloneNode(true)

  $result.querySelector('.app-postcode-summary').dataset.postcodeSummary = postcode

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

PostcodeStats.prototype.displayLatestAggregateStats = function (stats) {
  const $aggStats = this.$aggregateSummaryTemplate.content.cloneNode(true)

  // update values in aggregate panel
  const $total = $aggStats.querySelector('[data-aggregate="total-transactions"]')
  $total.textContent = readableNumber(stats.total)
  const $avgPrice = $aggStats.querySelector('[data-aggregate="avg-price"]')
  $avgPrice.textContent = readableNumber(stats.average_price)
  const $potentialLTT = $aggStats.querySelector('[data-aggregate="potential-ltt"]')
  $potentialLTT.textContent = readableNumber(stats.potential_ltt_revenue)

  // empty container
  this.$aggregateSummaryContainer.textContent = ''
  this.$aggregateSummaryContainer.appendChild($aggStats)
}

PostcodeStats.prototype.fetchAggregateStats = function () {
  const that = this
  if (this.$aggregateSummaryContainer) {
    if (this.selectedPostcodes.length > 0) {
      this.$aggregateSummaryContainer.classList.remove('js-hidden')
      const args = this.selectedPostcodes.map((postcode) => `postcode=${postcode}`).join('&')
      fetch(`/prototypes/postcode-stats/?${args}`)
        .then(response => response.json())
        .then(function (data) {
          that.displayLatestAggregateStats(data)
        })
    } else {
      this.$aggregateSummaryContainer.classList.add('js-hidden')
    }
  }
}

PostcodeStats.prototype.fetchStats = function (postcode) {
  const that = this
  fetch(`/prototypes/postcode-stats/${postcode}`)
    .then(response => response.json())
    .then(function (data) {
      that.createResult(postcode, data[postcode])
      that.fetchAggregateStats()
    })
    // consider adding error handling incase the fetch fails
}

PostcodeStats.prototype.hideContainers = function () {
  this.$resultsContainer.classList.add('app-postcode-stat-results--none')
  this.$selectedListContainer.classList.add('empty-hidden')
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

PostcodeStats.prototype.newSelection = function (postcode) {
  if (!this.selectedPostcodes.includes(postcode)) {
    // update UI with selected postcode
    this.selectedPostcodes.push(postcode)
    this.addSelectedItem(postcode)
    this.checkSelection()
    this.updateURL()
    // fetch stats for selection
    this.fetchStats(postcode)
    // trigger event - to do change name to dispatch
    this.triggerNewSelectionEvent(postcode)
  } else {
    // handle better
    console.log(`${postcode} already selected`)
  }
}

PostcodeStats.prototype.removeHandler = function (e) {
  // check anchor clicked on
  if (e.target.tagName.toLowerCase() === 'a' && e.target.classList.contains('app-selected-item__remove')) {
    e.preventDefault()
    const $anchor = e.target.closest('.app-selected-item')
    const $item = $anchor.closest('.app-selected-item')
    const postcode = $anchor.dataset.postcode
    console.log(e, postcode)
    // remove postcode from selected list
    utils.removeItemOnce(this.selectedPostcodes, postcode)
    // remove item from list
    $item.remove()
    // remove summary card (need to remove container element)
    console.log('container', this.$resultsContainer, 'postcode', postcode)
    this.$resultsContainer
      .querySelector(`[data-postcode-summary="${postcode}"]`)
      .closest('.col-lg-4')
      .remove()
    // update url
    this.updateURL()
    // re do aggregate stats
    this.fetchAggregateStats()
    // check if anything still selected
    this.checkSelection()
    // To do: trigger event for observers
    this.triggerRemoveSelectionEvent(postcode)
  }
}

PostcodeStats.prototype.showContainers = function () {
  this.$resultsContainer.classList.remove('app-postcode-stat-results--none')
  this.$selectedListContainer.classList.remove('empty-hidden')
}

PostcodeStats.prototype.submitHandler = function (e) {
  e.preventDefault()
  const selection = this.$input.value
  this.newSelection(selection)
}

PostcodeStats.prototype.triggerNewSelectionEvent = function (postcode) {
  if (this.observers.length) {
    const selectionEvent = new CustomEvent('newSelection', { detail: { postcode: postcode } })
    this.observers.forEach(function ($el) {
      $el.dispatchEvent(selectionEvent)
    })
  }
}

PostcodeStats.prototype.triggerRemoveSelectionEvent = function (postcode) {
  console.log('dispatch event')
  if (this.observers.length) {
    const removeSelectionEvent = new CustomEvent('removeSelection', { detail: { postcode: postcode } })
    this.observers.forEach(function ($el) {
      $el.dispatchEvent(removeSelectionEvent)
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
