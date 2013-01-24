// Copyright 2012 Stuart Turner
// Licensed under the Apache License, Version 2.0 [http://www.apache.org/licenses/LICENSE-2.0]

(function () {
	var genericValidate = function () {
		var self = this;
		self.getValidateFn = function (valueAccessor) {
			var validateFn = valueAccessor();
			if (typeof valueAccessor() === 'function') {
				return validateFn;
			}
		},
		self.init = function (element, valueAccessor, allBindingsAccessor, viewModel) {
			if (!viewModel.__validate_results) viewModel.__validate_results = ko.observableArray();
			if (!viewModel.error_messages) viewModel.error_messages = ko.observableArray();
			if (!viewModel.isValid) {
				// actual isValid value exposed for submit buttons and such
				// simply runs through each result in array and checks
				// if any failures in validation, then whole thing is invalid
				viewModel.isValid = ko.computed(function () {
					var flag = true;
					$.each(viewModel.__validate_results(), function (idx, obs) {
						if (obs() === false) {
							flag = false;
						}
					});
					return flag;
				});
			}

			// only show messages/error highlighting after visit
			var hasBeenVisited = false;
			var jq_element = $(element);
			var element_id = jq_element.attr('id');
			var jq_label = jq_element.siblings('label').filter('[for=' + element_id + ']');
			// if no label that points directly to the element, see if there is only one sibling label
			// if so, then use that one instead
			if (!jq_label.length) {
				if (jq_element.siblings('label').length == 1) {
					jq_label = jq_element.siblings('label');
				}
			}

			// cache error stuff for use later
			var error_message = allBindingsAccessor().error_message;
			var error_object = { id: element_id, message: error_message };

			// actual validation function
			var validateFn = self.getValidateFn(valueAccessor);

			// boolean observable to track results
			var result_obs = ko.observable(false);

			// runs on change of observable - shows/hides error status
			var computed = ko.computed(function () {
				if (result_obs() === false) {
					if (hasBeenVisited) {
						jq_element.addClass('error');
						jq_label.addClass('error');

						if (error_message) {
							if (viewModel.error_messages.indexOf(error_object) == -1) {
								viewModel.error_messages.push(error_object);
							}
						};
					}
					return false;
				}
				else {
					jq_element.removeClass('error');
					jq_label.removeClass('error');

					if (error_message) {
						viewModel.error_messages.remove(error_object);
					};
				}
			});

			// function to pass observable to the validation function and to update w/ return
			var fn = function () {
				result_obs(validateFn(result_obs));
			};
			fn();

			// if we are attached to an observable, then we want to know when the observable changes
			// primarily used for the required/requiredID type validation models
			if (ko.isObservable(valueAccessor())) {
				valueAccessor().subscribe(fn);
			}
			
			// control arrays need to be updated for isValid() to work
			viewModel.__validate_results.push(result_obs);

			// first time we visit box, we acknowledge so errors can show
			jq_element.bind('focus.validate', function (ev) {
				hasBeenVisited = true;
				jq_element.unbind(ev);
			});

			// when we leave a box, call validation for this box
			// if changes happen, then computeds run and propogate value
			jq_element.bind('blur.validate', function (ev) {
				fn();
			});
		},
		self.update = function (element, valueAccessor, allBindingsAccessor, viewModel) { }
	};

	var requiredValidate = new genericValidate();
	requiredValidate.getValidateFn = function (valueAccessor) {
		var obs = valueAccessor();
		return function () {
			var value = ko.utils.unwrapObservable(obs);
			if (value == null)
				return false;
			if (value === '')
				return false;
			return true;
		};
	};

	var requiredIDValidate = new genericValidate();
	requiredIDValidate.getValidateFn = function (valueAccessor) {
		var obs = valueAccessor();
		return function () {
			var value = ko.utils.unwrapObservable(obs);
			if (value == null)
				return false;
			if (value == 0)
				return false;
			return true;
		};
	};

	ko.bindingHandlers.validate = new genericValidate();
	ko.bindingHandlers.required = requiredValidate;
	ko.bindingHandlers.requiredID = requiredIDValidate;
})();

