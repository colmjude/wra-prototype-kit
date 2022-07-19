import utils from '../utils.js'

/* global fetch */

function TaxRates ($taxSection) {
  this.$taxSection = $taxSection
}

TaxRates.prototype.init = function (options) {
  this.setOptions(options)

  // hid until location in wales found
  this.hideSection()

  this.$ltt = this.$taxSection.querySelector('[data-tax-info="ltt"]')
  this.$councilTax = this.$taxSection.querySelector('[data-tax-info="council-tax"]')

  // the summary container
  this.$container = this.$taxSection.closest(this.options.containerSelector)

  // if location is in Wales then perform these searches
  const boundInWalesHandler = this.inWalesHandler.bind(this)
  this.$container.addEventListener(this.options.customEventName, boundInWalesHandler)

  return this
}

TaxRates.prototype.inWalesHandler = function (e) {
  console.log('inWales event heard')
  console.log(e)
  const relevantFeatures = utils.getRelevantFeatures(e.detail.data, 'localauthorities')
  if (relevantFeatures.length) {
    this.localAuthorityFeature = relevantFeatures[0]
    this.showSection()
    this.getCouncilTaxRates()
  }
}

TaxRates.prototype.getCouncilTaxRates = function () {
  if (!this.localAuthorityFeature) {
    // to do: add better handling of error cases
    return false
  }
  fetch(this.setEndpoint(this.localAuthorityFeature.properties.code))
    .then(response => response.json())
    .then(function (rates) {
      console.log(rates)
    })
}

TaxRates.prototype.hideSection = function () {
  this.$taxSection.classList.add('js-hidden')
}

TaxRates.prototype.setEndpoint = function (geography) {
  return `/prototypes/council-tax?geography=${geography}`
}

TaxRates.prototype.showSection = function () {
  this.$taxSection.classList.remove('js-hidden')
}

TaxRates.prototype.setOptions = function (opts) {
  const options = opts || {}
  this.options = utils.extend(taxRateDefaults, options)
}

const taxRateDefaults = {
  containerSelector: '[data-locator="locator-summary"]',
  customEventName: 'inWales'
}

export default TaxRates
