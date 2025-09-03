// Константы и настройки
const DEFAULT_VALUES = {
    pricePerMeter: 1500,
    basePreparation: 50,
    sealingJoints: 40,
    armatureLayer1: 120,
    armatureLayer2: 180,
    pouring: 120,
    finishing: 150,
    fuelPrice: 66,
    consumables: 0,
    unforeseenExpenses: 0,
    remuneration: 0
};

const TAX_RATES = {
    usn: 0.12,
    osn: 0.35
};

// Элементы DOM
const elements = {
    area: document.getElementById('area'),
    pricePerMeter: document.getElementById('pricePerMeter'),
    objectName: document.getElementById('objectName'),
    basePreparation: document.getElementById('basePreparation'),
    rateBasePreparation: document.getElementById('rateBasePreparation'),
    sealingJoints: document.getElementById('sealingJoints'),
    rateSealingJoints: document.getElementById('rateSealingJoints'),
    armature1: document.getElementById('armature1'),
    rateArmature1: document.getElementById('rateArmature1'),
    armature2: document.getElementById('armature2'),
    rateArmature2: document.getElementById('rateArmature2'),
    pouring: document.getElementById('pouring'),
    ratePouring: document.getElementById('ratePouring'),
    finishing: document.getElementById('finishing'),
    rateFinishing: document.getElementById('rateFinishing'),
    taxUsn: document.getElementById('usn'),
    taxOsn: document.getElementById('osn'),
    transport: document.getElementById('transport'),
    fuelLiters: document.getElementById('fuelLiters'),
    fuelPrice: document.getElementById('fuelPrice'),
    consumables: document.getElementById('consumables'),
    unforeseenExpenses: document.getElementById('unforeseenExpenses'),
    remuneration: document.getElementById('remuneration'),
    modeArea: document.getElementById('modeArea'),
    modeVolume: document.getElementById('modeVolume'),
    areaLabel: document.getElementById('areaLabel'),
    pricePerMeterLabel: document.getElementById('pricePerMeterLabel'),
    consumablesLabel: document.getElementById('consumablesLabel'),
    remunerationLabel: document.getElementById('remunerationLabel'),
    workTypesCard: document.getElementById('workTypesCard'),
    pouringLabel: document.getElementById('pouringLabel'),
    rateBasePreparationUnit: document.getElementById('rateBasePreparationUnit'),
    rateSealingJointsUnit: document.getElementById('rateSealingJointsUnit'),
    rateArmature1Unit: document.getElementById('rateArmature1Unit'),
    rateArmature2Unit: document.getElementById('rateArmature2Unit'),
    ratePouringUnit: document.getElementById('ratePouringUnit'),
    rateFinishingUnit: document.getElementById('rateFinishingUnit'),
    pouringWorkItem: document.getElementById('pouringWorkItem'),
    clearBtn: document.getElementById('clearBtn'),
    exportExcelBtn: document.getElementById('exportExcelBtn'),
    saveCalculationBtn: document.getElementById('saveCalculationBtn'),
    savedCalculationsBody: document.getElementById('savedCalculationsBody'),
    clearAllSavedCalculationsBtn: document.getElementById('clearAllSavedCalculationsBtn')
};

// Элементы результатов
const results = {
    revenue: document.getElementById('revenue'),
    workCost: document.getElementById('workCost'),
    transportCost: document.getElementById('transportCost'),
    fuelCost: document.getElementById('fuelCost'),
    totalExpenses: document.getElementById('totalExpenses'),
    taxDeduction: document.getElementById('taxDeduction'),
    netProfit: document.getElementById('netProfit'),
    consumablesCost: document.getElementById('consumablesCost'),
    unforeseenExpensesCost: document.getElementById('unforeseenExpensesCost'),
    remunerationCost: document.getElementById('remunerationCost')
};

// Временные данные (без localStorage)
let calculationData = {
    objectName: '',
    area: 0,
    pricePerMeter: DEFAULT_VALUES.pricePerMeter,
    selectedWorks: [],
    taxType: 'usn',
    transport: 0,
    fuelLiters: 0,
    fuelPrice: DEFAULT_VALUES.fuelPrice,
    consumables: DEFAULT_VALUES.consumables,
    unforeseenExpenses: DEFAULT_VALUES.unforeseenExpenses,
    remuneration: DEFAULT_VALUES.remuneration,
    calculationMode: 'area' // Добавляем новый параметр режима расчета
};

// Массив для хранения всех сохраненных расчетов
let savedCalculations = [];

// Форматирование валюты
function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

// Анимация обновления значения
function animateValueUpdate(element) {
    element.classList.add('updated');
    setTimeout(() => {
        element.classList.remove('updated');
    }, 300);
}

// Обновление UI в зависимости от режима расчета
function updateUIMode(mode) {
    // Обновление метки и плейсхолдера для площади/объема
    if (mode === 'area') {
        elements.areaLabel.textContent = 'Площадь (м²) *';
        elements.area.placeholder = 'Введите площадь';
    } else {
        elements.areaLabel.textContent = 'Объем (м³) *';
        elements.area.placeholder = 'Введите объем';
    }

    // Обновление метки цены за м2/м3
    elements.pricePerMeterLabel.textContent = `Цена за ${mode === 'area' ? 'квадратный метр' : 'кубический метр'} (руб.)`;

    // Обновление единиц измерения для расходных материалов и вознаграждения
    elements.consumablesLabel.textContent = `Расходные материалы (руб. за м${mode === 'area' ? '²' : '³'})`;
    elements.remunerationLabel.textContent = `Вознаграждение (руб. за м${mode === 'area' ? '²' : '³'})`;

    // Скрытие/показ видов работ
    const allWorkItems = elements.workTypesCard.querySelectorAll('.checkbox-item');
    allWorkItems.forEach(item => {
        item.style.display = 'flex'; // Показываем все по умолчанию
    });

    if (mode === 'volume') {
        elements.basePreparation.closest('.checkbox-item').style.display = 'none';
        elements.sealingJoints.closest('.checkbox-item').style.display = 'none';
        elements.armature1.closest('.checkbox-item').style.display = 'none';
        elements.armature2.closest('.checkbox-item').style.display = 'none';
        elements.finishing.closest('.checkbox-item').style.display = 'none';
        elements.pouringWorkItem.style.display = 'flex'; // Показываем только заливку монолита

        // Обновляем текст метки для заливки монолита
        elements.pouringLabel.firstChild.textContent = 'Заливка монолита';
        elements.ratePouringUnit.textContent = 'руб/м³';
    } else {
        // Возвращаем исходный текст для заливки плиты
        elements.pouringLabel.firstChild.textContent = 'Заливка плиты';
        elements.ratePouringUnit.textContent = 'руб/м²';
    }

    // Обновление единиц измерения для видов работ
    elements.rateBasePreparationUnit.textContent = `руб/м${mode === 'area' ? '²' : '³'}`;
    elements.rateSealingJointsUnit.textContent = `руб/м${mode === 'area' ? '²' : '³'}`;
    elements.rateArmature1Unit.textContent = `руб/м${mode === 'area' ? '²' : '³'}`;
    elements.rateArmature2Unit.textContent = `руб/м${mode === 'area' ? '²' : '³'}`;
    elements.ratePouringUnit.textContent = `руб/м${mode === 'area' ? '²' : '³'}`;
    elements.rateFinishingUnit.textContent = `руб/м${mode === 'area' ? '²' : '³'}`;
}

// Получение данных из формы
function getFormData() {
    const area = parseFloat(elements.area.value) || 0;
    const pricePerMeter = parseFloat(elements.pricePerMeter.value) || 0;
    const transport = parseFloat(elements.transport.value) || 0;
    const fuelLiters = parseFloat(elements.fuelLiters.value) || 0;
    const fuelPrice = parseFloat(elements.fuelPrice.value) || 0;
    const objectName = elements.objectName.value.trim();
    const consumables = parseFloat(elements.consumables.value) || 0;
    const unforeseenExpenses = parseFloat(elements.unforeseenExpenses.value) || 0;
    const remuneration = parseFloat(elements.remuneration.value) || 0;
    const calculationMode = elements.modeArea.checked ? 'area' : 'volume';

    const selectedWorks = [];

    const rateBasePreparation = parseFloat(elements.rateBasePreparation.value) || 0;
    if (elements.basePreparation.checked && rateBasePreparation > 0) {
        selectedWorks.push({ name: 'basePreparation', rate: rateBasePreparation });
    }

    const rateSealingJoints = parseFloat(elements.rateSealingJoints.value) || 0;
    if (elements.sealingJoints.checked && rateSealingJoints > 0) {
        selectedWorks.push({ name: 'sealingJoints', rate: rateSealingJoints });
    }

    const rateArmature1 = parseFloat(elements.rateArmature1.value) || 0;
    if (elements.armature1.checked && rateArmature1 > 0) {
        selectedWorks.push({ name: 'armature1', rate: rateArmature1 });
    }

    const rateArmature2 = parseFloat(elements.rateArmature2.value) || 0;
    if (elements.armature2.checked && rateArmature2 > 0) {
        selectedWorks.push({ name: 'armature2', rate: rateArmature2 });
    }

    const ratePouring = parseFloat(elements.ratePouring.value) || 0;
    if (elements.pouring.checked && ratePouring > 0) {
        selectedWorks.push({ name: 'pouring', rate: ratePouring });
    }

    const rateFinishing = parseFloat(elements.rateFinishing.value) || 0;
    if (elements.finishing.checked && rateFinishing > 0) {
        selectedWorks.push({ name: 'finishing', rate: rateFinishing });
    }
    
    const taxType = elements.taxUsn.checked ? 'usn' : 'osn';
    
    return {
        area,
        pricePerMeter,
        selectedWorks,
        taxType,
        transport,
        fuelLiters,
        fuelPrice,
        objectName,
        consumables,
        unforeseenExpenses,
        remuneration,
        calculationMode,
        // Сохраняем индивидуальные тарифы для возможности их загрузки
        rates: {
            basePreparation: rateBasePreparation,
            sealingJoints: rateSealingJoints,
            armature1: rateArmature1,
            armature2: rateArmature2,
            pouring: ratePouring,
            finishing: rateFinishing,
        }
    };
}

// Основные расчеты
function calculateEconomics(data) {
    // Доходы
    const revenue = data.area * data.pricePerMeter;
    
    // Стоимость работ
    let workCost = 0;
    if (data.calculationMode === 'volume') {
        // В режиме объема учитываем только Заливку монолита
        if (data.selectedWorks.some(work => work.name === 'pouring')) {
            workCost = data.area * data.rates.pouring;
        }
    } else {
        // В режиме площади учитываем все выбранные работы
        workCost = data.selectedWorks.reduce((sum, work) => {
            return sum + (data.area * work.rate);
        }, 0);
    }
    
    // Стоимость транспорта
    const transportCost = data.transport;
    
    // Стоимость бензина
    const fuelCost = data.fuelLiters * data.fuelPrice;
    
    // Стоимость расходных материалов
    const consumablesCost = data.area * data.consumables;

    // Непредвиденные расходы
    const unforeseenExpensesCost = data.unforeseenExpenses;

    // Вознаграждение
    const remunerationCost = data.area * data.remuneration;
    
    // Общие расходы
    const totalExpenses = workCost + transportCost + fuelCost + consumablesCost + unforeseenExpensesCost + remunerationCost;
    
    // НДС к вычету (от общих расходов)
    const taxRate = TAX_RATES[data.taxType];
    const taxDeduction = revenue * taxRate;
    
    // Чистая прибыль
    const netProfit = revenue - totalExpenses - taxDeduction;
    
    return {
        revenue,
        workCost,
        transportCost,
        fuelCost,
        consumablesCost,
        unforeseenExpensesCost,
        remunerationCost,
        totalExpenses,
        taxDeduction,
        netProfit
    };
}

// Обновление отображения результатов
function updateResults() {
    const data = getFormData();
    const calculations = calculateEconomics(data);
    
    // Обновляем UI в зависимости от режима расчета
    updateUIMode(data.calculationMode);

    // Обновляем значения с анимацией
    results.revenue.textContent = formatCurrency(calculations.revenue);
    animateValueUpdate(results.revenue);
    
    results.workCost.textContent = formatCurrency(calculations.workCost);
    animateValueUpdate(results.workCost);
    
    results.transportCost.textContent = formatCurrency(calculations.transportCost);
    animateValueUpdate(results.transportCost);
    
    results.fuelCost.textContent = formatCurrency(calculations.fuelCost);
    animateValueUpdate(results.fuelCost);
    
    results.consumablesCost.textContent = formatCurrency(calculations.consumablesCost);
    animateValueUpdate(results.consumablesCost);

    results.unforeseenExpensesCost.textContent = formatCurrency(calculations.unforeseenExpensesCost);
    animateValueUpdate(results.unforeseenExpensesCost);

    results.remunerationCost.textContent = formatCurrency(calculations.remunerationCost);
    animateValueUpdate(results.remunerationCost);
    
    results.totalExpenses.textContent = formatCurrency(calculations.totalExpenses);
    animateValueUpdate(results.totalExpenses);
    
    results.taxDeduction.textContent = formatCurrency(calculations.taxDeduction);
    animateValueUpdate(results.taxDeduction);
    
    results.netProfit.textContent = formatCurrency(calculations.netProfit);
    animateValueUpdate(results.netProfit);
    
    // Обновляем стиль для прибыли
    const profitRow = results.netProfit.closest('.profit-row');
    if (calculations.netProfit < 0) {
        profitRow.classList.add('profit-negative');
    } else {
        profitRow.classList.remove('profit-negative');
    }
    
    // Сохраняем данные в памяти (это больше не нужно для формы, но оставим для понимания)
    calculationData = data;
}

// Функция экспорта в Excel
function exportToExcel() {
    const data = getFormData();
    const calculations = calculateEconomics(data);

    // Подготавливаем данные для таблицы Excel
    const ws_data = [];

    // Заголовок
    ws_data.push(['Показатель', 'Значение']);

    // Название объекта
    if (data.objectName) {
        ws_data.push(['Название объекта', data.objectName]);
    }

    // Исходные данные
    const areaOrVolumeLabel = data.calculationMode === 'area' ? 'Площадь' : 'Объем';
    const areaOrVolumeUnit = data.calculationMode === 'area' ? 'м²' : 'м³';
    ws_data.push([areaOrVolumeLabel, `${data.area} ${areaOrVolumeUnit}`]);
    ws_data.push([`Цена за ${areaOrVolumeLabel.toLowerCase()}`, `${data.pricePerMeter} руб.`]);

    // Выбранные работы
    ws_data.push(['', '']); // Пустая строка для разделения
    ws_data.push(['Виды работ', 'Тариф']);

    if (data.calculationMode === 'volume') {
        if (data.selectedWorks.some(work => work.name === 'pouring')) {
            ws_data.push(['Заливка монолита', `${data.rates.pouring} руб/м³`]);
        }
    } else {
        // Подготовка основания
        if (data.selectedWorks.some(work => work.name === 'basePreparation')) {
            ws_data.push(['Подготовка основания', `${data.rates.basePreparation} руб/м²`]);
        }
        // Пилка и герметизация швов
        if (data.selectedWorks.some(work => work.name === 'sealingJoints')) {
            ws_data.push(['Пилка и герметизация швов', `${data.rates.sealingJoints} руб/м²`]);
        }
        // Вязка арматуры 1 слой
        if (data.selectedWorks.some(work => work.name === 'armature1')) {
            ws_data.push(['Вязка арматуры 1 слой', `${data.rates.armature1} руб/м²`]);
        }
        // Вязка арматуры 2 слой
        if (data.selectedWorks.some(work => work.name === 'armature2')) {
            ws_data.push(['Вязка арматуры 2 слой', `${data.rates.armature2} руб/м²`]);
        }
        // Заливка плиты
        if (data.selectedWorks.some(work => work.name === 'pouring')) {
            ws_data.push(['Заливка плиты', `${data.rates.pouring} руб/м²`]);
        }
        // Затирка плиты
        if (data.selectedWorks.some(work => work.name === 'finishing')) {
            ws_data.push(['Затирка плиты', `${data.rates.finishing} руб/м²`]);
        }
    }

    // Налогообложение
    ws_data.push(['', '']); // Пустая строка для разделения
    const taxName = data.taxType === 'usn' ? 'УСН (12%)' : 'ОСН (35%)';
    ws_data.push(['Налогообложение', taxName]);

    // Дополнительные расходы
    ws_data.push(['', '']); // Пустая строка для разделения
    ws_data.push(['Транспорт самогруз', `${data.transport} руб.`]);
    ws_data.push(['Бензин (литры)', `${data.fuelLiters} л`]);
    ws_data.push(['Цена за литр бензина', `${data.fuelPrice} руб.`]);
    ws_data.push(['Расходные материалы', `${data.consumables} руб/${areaOrVolumeUnit}`]);
    ws_data.push(['Непредвиденные расходы', `${data.unforeseenExpenses} руб.`]);
    ws_data.push(['Вознаграждение', `${data.remuneration} руб/${areaOrVolumeUnit}`]);

    // Результаты расчета
    ws_data.push(['', '']); // Пустая строка для разделения
    ws_data.push(['Доходы', formatCurrency(calculations.revenue)]);
    ws_data.push(['Стоимость работ', formatCurrency(calculations.workCost)]);
    ws_data.push(['Транспортные расходы', formatCurrency(calculations.transportCost)]);
    ws_data.push(['Расходы на бензин', formatCurrency(calculations.fuelCost)]);
    ws_data.push(['Стоимость расходных материалов', formatCurrency(calculations.consumablesCost)]);
    ws_data.push(['Непредвиденные расходы', formatCurrency(calculations.unforeseenExpensesCost)]);
    ws_data.push(['Вознаграждение', formatCurrency(calculations.remunerationCost)]);
    ws_data.push(['Общие расходы', formatCurrency(calculations.totalExpenses)]);
    ws_data.push(['НДС к вычету', formatCurrency(calculations.taxDeduction)]);
    ws_data.push(['Чистая прибыль', formatCurrency(calculations.netProfit)]);

    // Создаем рабочий лист
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Создаем рабочую книгу и добавляем лист
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Расчет");

    // Сохраняем файл
    const fileName = `Расчет по объекту ${data.objectName || 'без названия'}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// Функция сохранения текущего расчета
function saveCurrentCalculation() {
    if (!validateForm()) {
        alert('Пожалуйста, заполните обязательные поля: Площадь и Цена за квадратный метр.');
        return;
    }

    const data = getFormData();
    const calculations = calculateEconomics(data);

    const newCalculation = {
        id: Date.now(), // Уникальный ID для каждого расчета
        timestamp: new Date().toLocaleString('ru-RU'),
        inputData: data,
        results: calculations
    };

    savedCalculations.push(newCalculation);
    localStorage.setItem('savedFloorCalculations', JSON.stringify(savedCalculations));
    renderSavedCalculations();
    alert('Расчет сохранен!');
}

// Функция загрузки расчета в форму
function loadCalculation(id) {
    const calculationToLoad = savedCalculations.find(calc => calc.id === id);
    if (calculationToLoad) {
        const data = calculationToLoad.inputData;

        elements.objectName.value = data.objectName || '';
        elements.area.value = data.area || '';
        elements.pricePerMeter.value = data.pricePerMeter || DEFAULT_VALUES.pricePerMeter;
        elements.transport.value = data.transport || '';
        elements.fuelLiters.value = data.fuelLiters || '';
        elements.fuelPrice.value = data.fuelPrice || DEFAULT_VALUES.fuelPrice;
        elements.consumables.value = data.consumables || DEFAULT_VALUES.consumables;
        elements.unforeseenExpenses.value = data.unforeseenExpenses || DEFAULT_VALUES.unforeseenExpenses;
        elements.remuneration.value = data.remuneration || DEFAULT_VALUES.remuneration;

        // Восстанавливаем режим расчета
        if (data.calculationMode === 'volume') {
            elements.modeVolume.checked = true;
        } else {
            elements.modeArea.checked = true;
        }
        updateUIMode(data.calculationMode || 'area');

        // Восстанавливаем редактируемые тарифы
        elements.rateBasePreparation.value = data.rates.basePreparation || DEFAULT_VALUES.basePreparation;
        elements.rateSealingJoints.value = data.rates.sealingJoints || DEFAULT_VALUES.sealingJoints;
        elements.rateArmature1.value = data.rates.armature1 || DEFAULT_VALUES.armatureLayer1;
        elements.rateArmature2.value = data.rates.armature2 || DEFAULT_VALUES.armatureLayer2;
        elements.ratePouring.value = data.rates.pouring || DEFAULT_VALUES.pouring;
        elements.rateFinishing.value = data.rates.finishing || DEFAULT_VALUES.finishing;

        // Восстанавливаем чекбоксы выбранных работ
        elements.basePreparation.checked = data.selectedWorks.some(work => work.name === 'basePreparation');
        elements.sealingJoints.checked = data.selectedWorks.some(work => work.name === 'sealingJoints');
        elements.armature1.checked = data.selectedWorks.some(work => work.name === 'armature1');
        elements.armature2.checked = data.selectedWorks.some(work => work.name === 'armature2');
        elements.pouring.checked = data.selectedWorks.some(work => work.name === 'pouring');
        elements.finishing.checked = data.selectedWorks.some(work => work.name === 'finishing');

        elements.taxUsn.checked = data.taxType === 'usn';
        elements.taxOsn.checked = data.taxType === 'osn';

        updateResults(); // Обновляем отображение результатов на основе загруженных данных
        elements.area.focus();
        alert('Расчет загружен!');
    }
}

// Функция удаления расчета
function deleteCalculation(id) {
    if (confirm('Вы уверены, что хотите удалить этот расчет?')) {
        savedCalculations = savedCalculations.filter(calc => calc.id !== id);
        localStorage.setItem('savedFloorCalculations', JSON.stringify(savedCalculations));
        renderSavedCalculations();
        alert('Расчет удален!');
    }
}

// Функция рендеринга сохраненных расчетов в таблицу
function renderSavedCalculations() {
    elements.savedCalculationsBody.innerHTML = ''; // Очищаем таблицу перед рендерингом

    if (savedCalculations.length === 0) {
        elements.savedCalculationsBody.innerHTML = '<tr><td colspan="6" class="text-center">Нет сохраненных расчетов.</td></tr>';
        return;
    }

    savedCalculations.forEach(calc => {
        const row = elements.savedCalculationsBody.insertRow();
        row.insertCell().textContent = calc.inputData.objectName || 'Без названия';
        row.insertCell().textContent = `${calc.inputData.area} м²`;
        row.insertCell().textContent = formatCurrency(calc.results.revenue);
        row.insertCell().textContent = formatCurrency(calc.results.totalExpenses);
        row.insertCell().textContent = formatCurrency(calc.results.netProfit);

        const actionsCell = row.insertCell();
        const loadBtn = document.createElement('button');
        loadBtn.textContent = 'Загрузить';
        loadBtn.className = 'btn btn--small btn--secondary';
        loadBtn.onclick = () => loadCalculation(calc.id);
        actionsCell.appendChild(loadBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.className = 'btn btn--small btn--danger';
        deleteBtn.onclick = () => deleteCalculation(calc.id);
        actionsCell.appendChild(deleteBtn);
    });
}

// Функция очистки всех сохраненных расчетов
function clearAllSavedCalculations() {
    if (confirm('Вы уверены, что хотите удалить ВСЕ сохраненные расчеты?')) {
        savedCalculations = [];
        localStorage.removeItem('savedFloorCalculations');
        renderSavedCalculations();
        alert('Все сохраненные расчеты удалены!');
    }
}

// Валидация формы
function validateForm() {
    const area = parseFloat(elements.area.value);
    const pricePerMeter = parseFloat(elements.pricePerMeter.value);
    
    // Проверка обязательных полей
    if (!area || area <= 0) {
        elements.area.setCustomValidity('Площадь должна быть больше 0');
        return false;
    } else {
        elements.area.setCustomValidity('');
    }
    
    if (!pricePerMeter || pricePerMeter < 0) {
        elements.pricePerMeter.setCustomValidity('Цена не может быть отрицательной');
        return false;
    } else {
        elements.pricePerMeter.setCustomValidity('');
    }
    
    return true;
}

// Очистка всех полей
function clearAllFields() {
    // Сбрасываем текстовые поля
    elements.area.value = '';
    elements.pricePerMeter.value = DEFAULT_VALUES.pricePerMeter;
    elements.transport.value = '';
    elements.fuelLiters.value = '';
    elements.fuelPrice.value = DEFAULT_VALUES.fuelPrice;
    elements.objectName.value = '';
    elements.consumables.value = DEFAULT_VALUES.consumables;
    elements.unforeseenExpenses.value = DEFAULT_VALUES.unforeseenExpenses;
    elements.remuneration.value = DEFAULT_VALUES.remuneration;
    
    // Сбрасываем чекбоксы
    elements.armature1.checked = false;
    elements.armature2.checked = false;
    elements.pouring.checked = false;
    elements.finishing.checked = false;
    elements.basePreparation.checked = false;
    elements.sealingJoints.checked = false;

    // Сбрасываем режим расчета к по умолчанию
    elements.modeArea.checked = true;
    updateUIMode('area');
    
    // Сбрасываем редактируемые тарифы к дефолтным значениям
    elements.rateBasePreparation.value = DEFAULT_VALUES.basePreparation;
    elements.rateSealingJoints.value = DEFAULT_VALUES.sealingJoints;
    elements.rateArmature1.value = DEFAULT_VALUES.armatureLayer1;
    elements.rateArmature2.value = DEFAULT_VALUES.armatureLayer2;
    elements.ratePouring.value = DEFAULT_VALUES.pouring;
    elements.rateFinishing.value = DEFAULT_VALUES.finishing;
    
    // Сбрасываем радио кнопки
    elements.taxUsn.checked = true;
    
    // Обновляем расчеты
    updateResults();
    
    // Фокус на первое поле
    elements.area.focus();
}

// Обработчики событий
function setupEventListeners() {
    // Обновление расчетов при изменении любого поля
    const allInputs = [
        elements.area,
        elements.pricePerMeter,
        elements.objectName,
        elements.basePreparation,
        elements.rateBasePreparation,
        elements.sealingJoints,
        elements.rateSealingJoints,
        elements.armature1,
        elements.rateArmature1,
        elements.armature2,
        elements.rateArmature2,
        elements.pouring,
        elements.ratePouring,
        elements.finishing,
        elements.rateFinishing,
        elements.taxUsn,
        elements.taxOsn,
        elements.transport,
        elements.fuelLiters,
        elements.fuelPrice,
        elements.consumables,
        elements.unforeseenExpenses,
        elements.remuneration
    ];
    
    allInputs.forEach(input => {
        const eventType = input.type === 'checkbox' || input.type === 'radio' ? 'change' : 'input';
        input.addEventListener(eventType, () => {
            if (validateForm()) {
                updateResults();
            }
        });
    });
    
    elements.modeArea.addEventListener('change', () => updateResults());
    elements.modeVolume.addEventListener('change', () => updateResults());
    
    // Кнопка очистки
    elements.clearBtn.addEventListener('click', clearAllFields);
    
    // Кнопка экспорта в Excel
    elements.exportExcelBtn.addEventListener('click', exportToExcel);
    
    // Кнопка сохранения расчета
    elements.saveCalculationBtn.addEventListener('click', saveCurrentCalculation);

    // Кнопка очистки всех сохраненных расчетов
    elements.clearAllSavedCalculationsBtn.addEventListener('click', clearAllSavedCalculations);
    
    // Валидация в реальном времени
    elements.area.addEventListener('blur', validateForm);
    elements.pricePerMeter.addEventListener('blur', validateForm);
    
    // Предотвращение ввода отрицательных значений
    const numericInputs = [
        elements.area,
        elements.pricePerMeter,
        elements.transport,
        elements.fuelLiters,
        elements.fuelPrice,
        elements.consumables,
        elements.unforeseenExpenses,
        elements.remuneration
    ];
    
    numericInputs.forEach(input => {
        input.addEventListener('keydown', (e) => {
            // Разрешаем: backspace, delete, tab, escape, enter, точку, запятую
            if ([46, 8, 9, 27, 13, 110, 190, 188].includes(e.keyCode) ||
                // Разрешаем Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (e.keyCode === 65 && e.ctrlKey) ||
                (e.keyCode === 67 && e.ctrlKey) ||
                (e.keyCode === 86 && e.ctrlKey) ||
                (e.keyCode === 88 && e.ctrlKey) ||
                // Разрешаем стрелки
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                return;
            }
            // Блокируем всё кроме цифр
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
    });
}

// Инициализация приложения
function initApp() {
    // Устанавливаем дефолтные значения
    elements.pricePerMeter.value = DEFAULT_VALUES.pricePerMeter;
    elements.fuelPrice.value = DEFAULT_VALUES.fuelPrice;
    elements.taxUsn.checked = true;
    elements.consumables.value = DEFAULT_VALUES.consumables;
    elements.unforeseenExpenses.value = DEFAULT_VALUES.unforeseenExpenses;
    elements.remuneration.value = DEFAULT_VALUES.remuneration;

    // Устанавливаем дефолтные значения для редактируемых тарифов
    elements.rateBasePreparation.value = DEFAULT_VALUES.basePreparation;
    elements.rateSealingJoints.value = DEFAULT_VALUES.sealingJoints;
    elements.rateArmature1.value = DEFAULT_VALUES.armatureLayer1;
    elements.rateArmature2.value = DEFAULT_VALUES.armatureLayer2;
    elements.ratePouring.value = DEFAULT_VALUES.pouring;
    elements.rateFinishing.value = DEFAULT_VALUES.finishing;

    // Загружаем сохраненные расчеты при инициализации
    const storedCalculations = localStorage.getItem('savedFloorCalculations');
    if (storedCalculations) {
        savedCalculations = JSON.parse(storedCalculations);
    }
    
    // Настраиваем обработчики событий
    setupEventListeners();
    
    // Первоначальный расчет (чтобы показать дефолтные значения)
    updateResults();

    // Рендерим сохраненные расчеты
    renderSavedCalculations();
    
    // Фокус на первое поле
    elements.area.focus();
    
    // Устанавливаем режим расчета по умолчанию
    elements.modeArea.checked = true;
    updateUIMode('area');

    console.log('Калькулятор экономики заливки пола инициализирован');
}

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', initApp);

// Дополнительные утилиты для отладки
window.calculatorUtils = {
    getFormData,
    calculateEconomics,
    formatCurrency,
    clearAllFields,
    DEFAULT_VALUES,
    TAX_RATES,
    updateUIMode // Добавляем новую функцию для отладки
};