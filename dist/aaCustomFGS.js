(function () {
    'use strict';

    angular.module('aaCustomFGS', [
        'aa.formExtensions',
        'aa.formExternalConfiguration',
        'aa.notify',
        'aa.select2',
        'ui.bootstrap'])
        .provider('aaCustom', ['aaFormExtensionsProvider', '$injector',
            function aaCustomProvider(aaFormExtensionsProvider, $injector) {
            var service = {
            };

            this.initProvider = function () {
                aaFormExtensionsProvider.defaultOnNavigateAwayStrategy = "None";

                initLabelStrategies();
                initFieldGroupStrategies();
            };

            function initLabelStrategies() {
                aaFormExtensionsProvider.defaultLabelStrategy = "customLabelStrategy";
                aaFormExtensionsProvider.labelStrategies.customLabelStrategy = function (element, labelText, isRequired) {
                    var fgsElement = element.attr('aa-field-group-strategy');
                    if (!angular.isUndefined(fgsElement) && fgsElement.length > 0) {
                        switch (fgsElement) {
                            case 'checkBox':
                                return;
                        }
                    }

                    var colCls = getColOrClass(element, 'aa-lbl-col', 'aa-lbl-class', 'col-sm-2');

                    var label = angular.element('<label>')
                      .attr('for', element[0].id)
                      .addClass(colCls.col + ' control-label ' + colCls.cls)
                      .html(labelText + (isRequired ? '&nbsp;*' : ''));

                    var unsupported = [
                      'button',
                      'submit'
                    ];

                    if (unsupported.indexOf(element[0].type) !== -1) {
                        throw new Error("Generating a label for and input type " + element[0].type + " is unsupported.");
                    }

                    element.closest('.form-group').prepend(label);
                };
            }

            function getColOrClass(element, colAttr, classAttr, defaultCol) {
                var col = element.attr(colAttr),
                class_ = element.attr(classAttr);

                if (!angular.isUndefined(col) && !angular.isUndefined(class_)) {
                    col = 'col-' + col;
                }
                else if (!angular.isUndefined(col) && angular.isUndefined(class_)) {
                    col = 'col-' + col;
                    class_ = '';
                }

                if (angular.isUndefined(col) && angular.isUndefined(class_)) {
                    col = defaultCol;
                    class_ = '';
                }

                if (angular.isUndefined(col)) {
                    col = '';
                }

                return { col: col, cls: class_ };
            }

            function initFieldGroupStrategies() {
                initDefaultFGS();
                initCurrencyFGS();
                initDatePickerFGS();
                initCheckboxFGS();
                initSelect2FGS();
                initRadioFGS();
                initPercentFGS();
            }

            function commonFGSAlter(element) {
                //add form-control if it is missing
                if (!element.prop('class')) {
                    element.addClass('form-control');
                }

                var colCls = getColOrClass(element, 'aa-col', 'aa-class', 'col-sm-3');
                var fgcls = element.attr('aa-fg-class') || '';
                var ngshow = element.attr('ng-show') || '';
                if (ngshow.length > 0) {
                    ngshow = 'ng-show="' + ngshow + '"';
                }
                var lblColCls = getColOrClass(element, 'aa-lbl-col', 'aa-lbl-class', 'col-sm-2');

                return {
                    aaCol: colCls.col,
                    aaClass: colCls.cls,
                    aaFgClass: fgcls,
                    ngShow: ngshow,
                    lblClass: lblColCls.cls,
                    lblCol: lblColCls.col,
                    defaultWrapper: '<div class="form-group ' + fgcls + '" ' + ngshow + '><div class="' + colCls.cls + ' ' + colCls.col + '"><input/></div></div>'
                };
            }

            function initDefaultFGS() {
                aaFormExtensionsProvider.defaultFieldGroupStrategy = "customDefault";
                aaFormExtensionsProvider.fieldGroupStrategies.customDefault = function (element) {
                    var attrs = commonFGSAlter(element);

                    wrap(element, attrs.defaultWrapper);
                };
            }

            function initCurrencyFGS() {
                aaFormExtensionsProvider.fieldGroupStrategies.currency = function (element) {
                    var attrs = commonFGSAlter(element);

                    element.attr('aa-currency', '');

                    wrap(element, attrs.defaultWrapper);
                };
            }

            function initPercentFGS() {
                aaFormExtensionsProvider.fieldGroupStrategies.percent = function (element) {
                    var attrs = commonFGSAlter(element);

                    element.attr('aa-percent', '');

                    wrap(element, attrs.defaultWrapper);
                };
            }

            function initCheckboxFGS() {
                aaFormExtensionsProvider.fieldGroupStrategies.checkBox = function (element) {
                    var attrs = commonFGSAlter(element);

                    element.attr('aa-checkbox', '');
                    element.attr('type', 'checkbox');

                    wrap(element, '<div class="form-group ' + attrs.aaFgClass + '" ' + attrs.ngShow + '><div class="' + attrs.lblClass + ' ' + attrs.lblCol + '"></div><div class="checkbox chkbox-adjustment ' +
                        attrs.aaClass + ' ' + attrs.aaCol + '"><input/></div></div>');
                };
            }

            function initSelect2FGS() {
                aaFormExtensionsProvider.fieldGroupStrategies.select2 = function (element) {
                    var attrs = commonFGSAlter(element);

                    element.attr('aa-select-two', '');
                    element.attr('aa-select2', element.attr('config'));
                    element.attr('style', 'width:100%');

                    wrap(element, attrs.defaultWrapper);
                };
            }

            function initRadioFGS() {
                aaFormExtensionsProvider.fieldGroupStrategies.radio = function (element) {
                    var attrs = commonFGSAlter(element);

                    element.attr('aa-radio-group', '');
                    element.attr('type', 'radio');
                    element.attr('ng-if', '$first');
                    element.attr('ng-change', 'activate(opt, $event)');
                    element.attr('ng-value', 'opt.id');

                    wrap(element, '<div class="form-group ' + attrs.aaFgClass + '" ' + attrs.ngShow + '><div class="radio-update ' + attrs.aaClass + ' ' + attrs.aaCol + '"><label class="radio-inline" ng-repeat="opt in ' + element.attr('options') + '">' +
                        '<input/></label></div></div>');

                    var firstSpan = ' <span ng-if="$first">{{opt.name}}</span>';
                    $(element).after(angular.element(firstSpan));

                    var name = element.attr('name');
                    var requiredMsg = element.attr('required-msg');
                    var required = element.attr('required');
                    var ngrequired = element.attr('ng-required');
                    var isRequired = (!angular.isUndefined(requiredMsg) && requiredMsg.length > 0) ||
                        (!angular.isUndefined(required) && required.length > 0) ||
                        (!angular.isUndefined(ngrequired) && ngrequired.length > 0);
                    if (isRequired && (angular.isUndefined(requiredMsg) || requiredMsg.length === 0)) {
                        requiredMsg = name + ' is required.';
                    }

                    var reqdText = isRequired ? 'required required-msg="' + requiredMsg + '"' : '';

                    var secondInput = '<input type="radio" name=' + element.attr('name') + ' ng-if="!$first" ng-change="activate(opt, $event)" ng-model="' + element.attr('aa-field') + '" ng-value="opt.id" ' + reqdText + ' /> <span ng-if="!$first">{{opt.name}}</span>';
                    $(element).after(angular.element(secondInput));
                };
            }

            function initDatePickerFGS() {
                aaFormExtensionsProvider.fieldGroupStrategies.datePicker = function (element) {
                    var attrs = commonFGSAlter(element);

                    element.attr('aa-date-picker', '');
                    element.attr('datepicker-popup', 'MM/dd/yyyy');
                    element.attr('is-open', 'opened');

                    wrap(element, attrs.defaultWrapper);
                };
            }

            function wrap(elms, wrapper) {
                var wrapperDiv = document.createElement('div');
                wrapperDiv.innerHTML = wrapper;

                if (!elms.length) {
                    elms = [elms];
                }

                for (var i = elms.length - 1; i >= 0; i--) {
                    var el = elms[i];

                    var child = wrapperDiv.firstChild.cloneNode(true);
                    var inputElement = $(child).find('input');
                    if (angular.isUndefined(inputElement) || inputElement.length === 0) {
                        throw Error('>> input element required for field group strategy.');
                    }

                    var parent = el.parentNode;
                    var sibling = el.nextSibling;

                    inputElement.replaceWith(el);

                    if (sibling) {
                        parent.insertBefore(child, sibling);
                    } else {
                        parent.appendChild(child);
                    }
                }
            }

            this.$get = function aaCustomFactory() {
                return service;
            };
        }])
    .config(['aaCustomProvider', function (aaCustomProvider) {
        aaCustomProvider.initProvider();
    }])
    .config(['datepickerConfig', function (datepickerConfig) {
        datepickerConfig.showWeeks = false;
    }])
    .config(['datepickerPopupConfig', function (datepickerPopupConfig) {
        datepickerPopupConfig.datepickerPopup = 'MM/dd/yyyy';
        datepickerPopupConfig.closeText = "Close";
    }])
    .config(['$provide', function ($provide) {
        // Patch - https://github.com/angular-ui/bootstrap/commit/42cc3f269bae020ba17b4dcceb4e5afaf671d49b
        $provide.decorator('dateParser', ['$delegate', function ($delegate) {

            var oldParse = $delegate.parse;
            $delegate.parse = function (input, format) {
                if (!angular.isString(input) || !format) {
                    return input;
                }
                return oldParse.apply(this, arguments);
            };

            return $delegate;
        }]);
    }]);
})();
(function () {
    'use strict';

    angular
        .module('aaCustomFGS')
        .factory('aaSelectService', aaSelectService);

    aaSelectService.$inject = ['$http'];

    function aaSelectService($http) {
        var defaultId = 'id',
            defaultName = 'name';

        var service = {
            getConfigSingle: getConfigSingle,
            getConfigAjaxSingle: getConfigAjaxSingle,
            getConfigAjaxMultiple: getConfigAjaxMultiple
        };

        return service;

        function getConfigSingle(config) {
            return {
                mode: 'id',
                id: 'id' in config ? config.id : defaultId,
                text: 'name' in config ? config.name : defaultName,
                options: 'options' in config ? config.options : [],
                select2: getSelect2Options(config)
            };
        }

        function getConfigAjaxSingle(config) {
            assertAjaxConfigParms(config, 'getConfigAjaxSingle');

            var newConfig = getNewConfig(config);
            newConfig.mode = 'id';
            newConfig.textLookup = function (id) {
                return apiGetById(id, newConfig);
            };
            newConfig.options = function (searchText) {
                return apiSearch(searchText, newConfig);
            };

            return newConfig;
        }

        function getConfigAjaxMultiple(config) {
            assertAjaxConfigParms(config, 'getConfigAjaxMultiple');

            var newConfig = getNewConfig(config);
            newConfig.mode = 'tags-id';
            newConfig.textLookup = function (id) {
                return apiGetById(id, newConfig);
            };
            newConfig.options = function (searchText) {
                return apiSearch(searchText, newConfig);
            };

            return newConfig;
        }

        function getNewConfig(config) {
            return {
                id: 'id' in config ? config.id : defaultId,
                text: 'name' in config ? config.name : defaultName,
                select2: getSelect2Options(config),
                apiGetMethod: 'apiGetMethod' in config ? config.apiGetMethod : undefined,
                apiSearchMethod: 'apiSearchMethod' in config ? config.apiSearchMethod : undefined
            };
        }

        function assertAjaxConfigParms(config, methodName) {
            if (angular.isUndefined(config.apiGetMethod)) {
                throw new Error('apiGetMethod required in ' + methodName + ' method of aaSelectService.');
            }
            if (angular.isUndefined(config.apiSearchMethod)) {
                throw new Error('apiSearchMethod required in ' + methodName + ' method of aaSelectService.');
            }
        }

        function apiSearch(searchText, config) {
            //search for options with AJAX
            var parms = { searchText: searchText };

            return $http.get('api/Lookup/' + config.apiSearchMethod, parms);
        }

        function apiGetById(id, config) {
            //find the text for the selected id
            //looks at 'text' field above (name)
            return $http.get('api/Lookup/' + config.apiGetMethod, { id: id });
        }

        // Select2 options that can be added. See here (http://ivaynberg.github.io/select2/index.html) for more possible options.
        function getSelect2Options(config) {
            return {
                allowClear: 'allowClear' in config ? config.allowClear : true,
                minimumInputLength: 'minimumInputLength' in config ? config.minimumInputLength : 0,
                maximumInputLength: 'maximumInputLength' in config ? config.maximumInputLength : undefined,
                placeholder: 'placeholder' in config ? config.placeholder : 'Select...'
            };
        }
    }
})();
(function() {
    'use strict';

    angular
        .module('aaCustomFGS')
        .directive('aaCheckbox', aaCheckbox);

    function aaCheckbox () {
        var directive = {
            compile: compileFn,
            restrict: 'A',
            priority: 900
        };
        return directive;

        function compileFn(tElem, tAttrs) {

            return {
                pre: preLink,
                post: postLink
            };
        }

        function preLink(scope, iElem, iAttrs) {
        }

        function postLink(scope, element, attrs) {
            var lblText = element.attr('aa-label');
            element.removeAttr('aa-label');
            element.removeClass('form-control');

            // Doing this here instead of the field group strategy so that the validation errors go below the label tag,
            // otherwise, the error messages show up and bring down the checkbox.
            var textEl = angular.element('<span class="bold">' + lblText + '</span>');
            $(element).wrap('<label></label>');

            $(element).after(textEl);
        }
    }

})();
(function() {
    'use strict';

    angular
        .module('aaCustomFGS')
        .directive('aaCurrency', aaCurrency);

    aaCurrency.$inject = [];
    
    function aaCurrency() {
        var directive = {
            link: link,
            priority: 900,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            // Doing this here instead of the field group strategy so that the validation errors go below the input-group class,
            // otherwise, the error messages show up and bring down the currency symbol.
            var currencyEl = angular.element('<span class="input-group-addon currency">$</span>');
            $(element).wrap('<div class="input-group"></div>');

            $(element).before(currencyEl);
        }
    }

})();
(function() {
    'use strict';

    angular
        .module('aaCustomFGS')
        .directive('aaDatePicker', aaDatePicker);

    aaDatePicker.$inject = ['$compile'];
    
    function aaDatePicker($compile) {
        var directive = {
            link: link,
            priority: 900,
            restrict: 'A',
            controller: ['$scope', controller]
        };
        return directive;

        function controller($scope) {
            $scope.open = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.opened = true;
            };
        }

        function link(scope, element, attrs) {
            // Doing this here instead of the field group strategy so that the validation errors go below the <p> tag,
            // otherwise, the error messages show up and bring down the calender button.
            var datePickerBtn = angular.element('<span class="input-group-btn"><button type="button" class="btn btn-default" ng-click="open($event)"><i class="fa fa-calendar"></i></button></span>');
            $(element).wrap('<p class="input-group"></p>');

            // So the datepicker ng-click works...
            var newDateBtn = $compile(datePickerBtn)(scope);
            $(element).after(datePickerBtn);
        }
    }

})();
(function() {
    'use strict';

    angular
        .module('aaCustomFGS')
        .directive('aaPercent', aaPercent);

    aaPercent.$inject = [];

    function aaPercent() {
        var directive = {
            link: link,
            priority: 900,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            // Doing this here instead of the field group strategy so that the validation errors go below the input-group class,
            // otherwise, the error messages show up and bring down the percent symbol.
            var percentEl = angular.element('<span class="input-group-addon">%</span>');
            $(element).wrap('<div class="input-group"></div>');

            $(element).after(percentEl);
        }
    }

})();
(function() {
    'use strict';

    angular
        .module('aaCustomFGS')
        .directive('aaRadioGroup', aaRadioGroup);

    aaRadioGroup.$inject = [];

    function aaRadioGroup() {
        var directive = {
            compile: compileFn,
            restrict: 'A',
            require: ['^form'],
            controller: ['$scope', controllerDef],
            priority: 900
        };
        return directive;

        function compileFn(tElem, tAttrs) {
            tElem.removeClass('form-control');
            tElem.removeAttr('aa-field-group-strategy');
            tElem.removeAttr('aa-radio-group');

            return function (scope, element, attrs, controllers) {
                var ngForm = controllers[0];
                var invalidCheck = ngForm.$name + '.' + attrs['name'] + '.$invalid';
                scope.$watch(function () { return invalidCheck; }, function (field) {
                    if (!angular.isUndefined(field)) {
                        scope.$watch(field, function (isInvalid) {
                            if (isInvalid) {
                                $(element).closest('.radio-update').removeClass('form-item-invalid').addClass('form-item-invalid');
                            }
                            else {
                                $(element).closest('.radio-update').removeClass('form-item-invalid');
                            }
                        });
                    }
                });
            };
        }

        function controllerDef($scope) {
            $scope.activate = function (option, $event) {
                $scope.ngModel = option['id'];
                if ($event && $event.currentTarget.localName == 'label') {
                    var inputElement = $($event.currentTarget).find('input');
                    $(inputElement).prop('checked', true);
                }
            };
        }
    }

})();
(function() {
    'use strict';

    angular
        .module('aaCustomFGS')
        .directive('aaSelectTwo', aaSelectTwo);

    aaSelectTwo.$inject = [];
    
    function aaSelectTwo () {
        var directive = {
            link: postLink,
            restrict: 'A',
            priority: 900
        };
        return directive;

        function postLink(scope, element, attrs) {
            //element.removeAttr('aa-field-group-strategy');
            element.removeAttr('config');
            element.removeAttr('translate-label');
            element.removeAttr('aa-select-two');
            element.removeAttr('aa-label');
            element.removeClass('form-control');
        }
    }

})();