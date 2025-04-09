javascript
document.addEventListener('DOMContentLoaded', () => {

    // --- Globals & References ---
    const body = document.body;
    const darkModeToggle = document.getElementById('darkModeToggle');
    let funnelStagesChartInstance = null;
    let revenueBreakdownChartInstance = null;
    let sensitivityComparisonChartInstance = null;
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const funnelVizContainer = document.getElementById('funnelVizContainer');

    // Global Data Stores
    let products = [
         { id: Date.now() + 1, name: 'Sample Core Product', type: 'Main Offer', price: 497, cost: 0 },
         { id: Date.now() + 2, name: 'Sample Bump', type: 'Order Bump', price: 47, cost: 0 },
         { id: Date.now() + 3, name: 'Sample Upsell', type: 'Upsell 1', price: 997, cost: 0 },
         { id: Date.now() + 4, name: 'Sample Downsell', type: 'Downsell 1', price: 297, cost: 0 },
         { id: Date.now() + 5, name: 'Sample OTO', type: 'OTO', price: 197, cost: 0 }
    ];
    let expenses = [];
    let lastSimulationResults = null; // Store last results

    // Input References (Sidebar)
    const weeklyAdSpendInput = document.getElementById('weeklyAdSpend');
    const cpcInput = document.getElementById('adsCPC');
    const weeklyVisitorsInput = document.getElementById('weeklyVisitors');
    const optinRateInput = document.getElementById('optinRate');
    const attendanceRateInput = document.getElementById('attendanceRate');
    const conversionCoreInput = document.getElementById('conversionCore');
    const conversionBumpInput = document.getElementById('conversionBump');
    const conversionUpsellInput = document.getElementById('conversionUpsell');
    const conversionDownsellInput = document.getElementById('conversionDownsell');
    const conversionOTOInput = document.getElementById('conversionOTO');

    // Output References (Main Content)
    const flowVisitors = document.getElementById('flowVisitors');
    const flowOptins = document.getElementById('flowOptins');
    const flowAttendees = document.getElementById('flowAttendees');
    const flowCustomers = document.getElementById('flowCustomers');
    const resultRevenue = document.getElementById('resultRevenue');
    const resultExpenses = document.getElementById('resultExpenses');
    const resultProfit = document.getElementById('resultProfit');
    const resultROI = document.getElementById('resultROI');
    // Product Perf Elements (Container for table)
    const productPerformanceTableContainer = document.getElementById('productPerformanceTableContainer');


    // Sensitivity Analysis References
    const saCurrentSpend = document.getElementById('saCurrentSpend');
    const saCurrentCPC = document.getElementById('saCurrentCPC');
    const saCurrentVisitors = document.getElementById('saCurrentVisitors');
    const saCurrentOptin = document.getElementById('saCurrentOptin');
    const saCurrentAttendance = document.getElementById('saCurrentAttendance');
    const saCurrentConv = document.getElementById('saCurrentConv');
    const saCurrentBump = document.getElementById('saCurrentBump');
    const saCurrentUpsell = document.getElementById('saCurrentUpsell');
    const saCurrentDownsell = document.getElementById('saCurrentDownsell');
    const saCurrentOTO = document.getElementById('saCurrentOTO');
    const sensitivityCurrentValueItems = document.querySelectorAll('.sensitivity-current-values .current-value-item'); // NodeList
    // Inputs
    const saMetricSelect = document.getElementById('saMetricToVary');
    const saVariationInput = document.getElementById('saVariation');
    const analyzeSensitivityBtn = document.getElementById('analyzeSensitivityBtn');
    // Table Outputs
    const saOrigVisitors = document.getElementById('saOrigVisitors');
    const saAfterVisitors = document.getElementById('saAfterVisitors');
    const saDiffVisitors = document.getElementById('saDiffVisitors');
    const saOrigRevenue = document.getElementById('saOrigRevenue');
    const saAfterRevenue = document.getElementById('saAfterRevenue');
    const saDiffRevenue = document.getElementById('saDiffRevenue');
    const saOrigExpenses = document.getElementById('saOrigExpenses');
    const saAfterExpenses = document.getElementById('saAfterExpenses');
    const saDiffExpenses = document.getElementById('saDiffExpenses');
    const saOrigProdCosts = document.getElementById('saOrigProdCosts');
    const saAfterProdCosts = document.getElementById('saAfterProdCosts');
    const saDiffProdCosts = document.getElementById('saDiffProdCosts');
    const saOrigProfit = document.getElementById('saOrigProfit');
    const saAfterProfit = document.getElementById('saAfterProfit');
    const saDiffProfit = document.getElementById('saDiffProfit');
    const saOrigROI = document.getElementById('saOrigROI');
    const saAfterROI = document.getElementById('saAfterROI');
    const saDiffROI = document.getElementById('saDiffROI');

    // Dream Profit Goal References
    const dreamProfitInput = document.getElementById('dreamProfitGoalInput');
    const calculateDreamProfitBtn = document.getElementById('calculateDreamProfitBtn');
    const dpgHeaderAmount = document.getElementById('dpgHeaderAmount');
    // Table Outputs
    const dpgDayRevenue = document.getElementById('dpgDayRevenue');
    const dpgWeekRevenue = document.getElementById('dpgWeekRevenue');
    const dpgMonthRevenue = document.getElementById('dpgMonthRevenue');
    const dpgYearRevenue = document.getElementById('dpgYearRevenue');
    const dpgDayProfit = document.getElementById('dpgDayProfit');
    const dpgWeekProfit = document.getElementById('dpgWeekProfit');
    const dpgMonthProfit = document.getElementById('dpgMonthProfit');
    const dpgYearProfit = document.getElementById('dpgYearProfit');
    const dpgDayTraffic = document.getElementById('dpgDayTraffic');
    const dpgWeekTraffic = document.getElementById('dpgWeekTraffic');
    const dpgMonthTraffic = document.getElementById('dpgMonthTraffic');
    const dpgYearTraffic = document.getElementById('dpgYearTraffic');
    const dpgDayCost = document.getElementById('dpgDayCost');
    const dpgWeekCost = document.getElementById('dpgWeekCost');
    const dpgMonthCost = document.getElementById('dpgMonthCost');
    const dpgYearCost = document.getElementById('dpgYearCost');
    const dpgDayLeads = document.getElementById('dpgDayLeads');
    const dpgWeekLeads = document.getElementById('dpgWeekLeads');
    const dpgMonthLeads = document.getElementById('dpgMonthLeads');
    const dpgYearLeads = document.getElementById('dpgYearLeads');


    // --- Helper Functions ---
    const formatCurrency = (num) => num || num === 0 ? `$${(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00';
    const formatNumber = (num, decimals = 0) => num || num === 0 ? (num).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : '0';
    const formatPercent = (num) => num || num === 0 ? `${(num).toFixed(2)}%` : '0.00%';

    const applyFinancialStyle = (element, value, isDifferenceCell = false) => {
         element.classList.remove('positive', 'negative');
         if (value > 0) element.classList.add('positive');
         if (value < 0) element.classList.add('negative');

         if (isDifferenceCell && value > 0) {
            const currentText = element.textContent;
            if (currentText && !currentText.startsWith('+')) {
                 element.textContent = `+${currentText}`;
            }
         }
    };

    const calculateDifference = (original, after) => {
        const diff = after - original;
        const percentDiff = (original !== 0 && !isNaN(original)) ? (diff / Math.abs(original)) * 100 : (after !== 0 ? Infinity : 0);
         let percentString = '(NaN%)';
         if (isFinite(percentDiff)) {
             percentString = `(${(percentDiff >= 0 ? '+' : '')}${percentDiff.toFixed(2)}%)`;
         } else if (after !== 0 && original === 0) {
            percentString = '(+Inf%)';
         } else if (after === 0 && original !== 0) {
            percentString = '(-100.00%)';
         } else if (after === 0 && original === 0){
             percentString = '(0.00%)';
         }

        return {
            absolute: diff,
            percent: percentDiff,
            percentString: percentString
        };
    };

     // --- Dark Mode ---
    const applyDarkModePreference = () => {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        darkModeToggle.checked = isDarkMode;
        if (isDarkMode) {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
        // Update charts if they exist
        if(funnelStagesChartInstance || revenueBreakdownChartInstance || sensitivityComparisonChartInstance) {
            updateChartColors();
        }
    };

    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'false');
        }
         updateChartColors();
    });


    // --- Chart Colors based on Mode ---
    function getChartColors() {
         const isDarkMode = body.classList.contains('dark-mode');
         return {
             backgroundColor: [ /* Adjusted colors for better visibility */
                'rgba(156, 102, 223, 0.7)', /* Lighter Purple */
                'rgba(75, 137, 252, 0.7)',  /* Lighter Blue */
                'rgba(64, 196, 182, 0.7)',  /* Lighter Teal */
                'rgba(255, 186, 104, 0.7)', /* Lighter Orange */
                'rgba(128, 142, 228, 0.7)'  /* Lighter Indigo */
             ],
              backgroundColorHover: [
                'rgba(126, 87, 194, 0.9)',
                'rgba(37, 117, 252, 0.9)',
                'rgba(38, 166, 154, 0.9)',
                'rgba(255, 171, 64, 0.9)',
                'rgba(92, 107, 192, 0.9)'
             ],
             borderColor: isDarkMode ? 'rgba(68, 68, 68, 1)' : 'rgba(255, 255, 255, 1)',
             gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
             ticksColor: isDarkMode ? '#adb5bd' : '#6c757d',
             legendColor: isDarkMode ? '#e0e0e0' : '#333',
             tooltipBg: isDarkMode ? '#2c2c2c' : '#fff',
             tooltipText: isDarkMode ? '#e0e0e0' : '#333'
         };
    }

    // --- Chart Initialization & Updates ---
     function initOrUpdateChart(chartInstance, chartId, chartType, data, options) {
        const ctx = document.getElementById(chartId);
        if (!ctx) {
            console.error(`Canvas element with ID '${chartId}' not found.`);
            return null;
        }
        const colors = getChartColors(); // Get current colors

        // For Chart.js v2, apply theme colors
        if (options.tooltips) {
            options.tooltips.backgroundColor = colors.tooltipBg;
            options.tooltips.titleFontColor = colors.tooltipText;
            options.tooltips.bodyFontColor = colors.tooltipText;
        }
        
        if (options.legend && options.legend.labels) {
            options.legend.labels.fontColor = colors.legendColor;
        }
        
        // Apply colors to scales if they exist
        if (options.scales) {
            if (options.scales.yAxes) {
                options.scales.yAxes.forEach(yAxis => {
                    if (yAxis.gridLines) {
                        yAxis.gridLines.color = colors.gridColor;
                    }
                    if (yAxis.ticks) {
                        yAxis.ticks.fontColor = colors.ticksColor;
                    }
                });
            }
            
            if (options.scales.xAxes) {
                options.scales.xAxes.forEach(xAxis => {
                    if (xAxis.gridLines) {
                        xAxis.gridLines.color = colors.gridColor;
                    }
                    if (xAxis.ticks) {
                        xAxis.ticks.fontColor = colors.ticksColor;
                    }
                });
            }
        }

        if (chartInstance) {
            chartInstance.data = data;
            chartInstance.options = options;
            chartInstance.update();
            return chartInstance;
        } else {
           try {
               return new Chart(ctx.getContext('2d'), {
                   type: chartType,
                   data: data,
                   options: options
               });
           } catch (error) {
               console.error(`Error initializing chart '${chartId}':`, error);
               return null;
           }
        }
    }


     function updateChartColors() {
         // If simulation has run, recreate charts with new colors
         if (lastSimulationResults) {
             createCharts(lastSimulationResults);
             // Re-run sensitivity analysis to update its chart colors
              if (analyzeSensitivityBtn) { // Check if element exists
                 analyzeSensitivityBtn.click(); // Re-running SA will also update its chart
             }
         } else {
             // If no simulation run yet, initialize charts with correct colors
             createCharts();
             // Also initialize the SA chart (likely with zeros)
             analyzeSensitivityBtn.click();
         }
     }

     function createCharts(simulationData = null) {
        const colors = getChartColors();
        const hasData = simulationData && simulationData.inputs;

         // --- Funnel Stages Chart ---
         const funnelStagesData = {
             labels: ['Opt-in Rate', 'Attendance Rate', 'Webinar Conv Rate'],
             datasets: [{
                 label: 'Rate (%)',
                 data: hasData ? [
                     simulationData.inputs.rates.optin || 0,
                     simulationData.inputs.rates.attendance || 0,
                     simulationData.inputs.rates.coreConversion || 0
                 ] : [0, 0, 0], // Default to 0 if no data
                 backgroundColor: colors.backgroundColor[0],
                 borderColor: colors.borderColor,
                 borderWidth: 1,
                 barPercentage: 0.6,
             }]
         };
         const funnelStagesOptions = {
             responsive: true, 
             maintainAspectRatio: false,
             legend: { display: false },
             scales: {
                 yAxes: [{
                     ticks: {
                         beginAtZero: true,
                         max: 100,
                         callback: function(value) {
                             return value + '%';
                         }
                     }
                 }],
                 xAxes: [{
                     gridLines: {
                         display: false
                     }
                 }]
             }
         };
        funnelStagesChartInstance = initOrUpdateChart(funnelStagesChartInstance, 'funnelStagesChart', 'bar', funnelStagesData, funnelStagesOptions);

        // --- Revenue Breakdown Chart ---
        const revenueBreakdownLabels = hasData ? (simulationData.revenueBreakdown?.map(item => item.name) || []) : [];
        const revenueBreakdownValues = hasData ? (simulationData.revenueBreakdown?.map(item => item.revenue) || []) : [];
        const revenueBreakdownData = {
            labels: revenueBreakdownLabels.length > 0 ? revenueBreakdownLabels : ['No Revenue Yet'], // Placeholder label
            datasets: [{
                label: 'Revenue',
                data: revenueBreakdownValues.length > 0 ? revenueBreakdownValues : [1], // Placeholder value > 0 for chart to render
                backgroundColor: revenueBreakdownValues.length > 0 ? colors.backgroundColor : ['#cccccc'], // Gray if no data
                hoverBackgroundColor: colors.backgroundColorHover,
                borderColor: colors.borderColor, 
                borderWidth: 1
            }]
         };
         const revenueBreakdownOptions = {
             responsive: true, 
             maintainAspectRatio: false,
             legend: { 
                 position: 'bottom', 
                 labels: { 
                     boxWidth: 12, 
                     padding: 15 
                 }
             },
             tooltips: {
                 callbacks: {
                     label: function(tooltipItem, data) {
                         const dataset = data.datasets[tooltipItem.datasetIndex];
                         if (!dataset.data || dataset.data.length === 0 || revenueBreakdownValues.length === 0) return '';
                         
                         const total = dataset.data.reduce((acc, val) => acc + (val || 0), 0);
                         const value = dataset.data[tooltipItem.index] || 0;
                         const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                         return `${data.labels[tooltipItem.index]}: ${formatCurrency(value)} (${percentage}%)`;
                     }
                 }
             }
         };
        revenueBreakdownChartInstance = initOrUpdateChart(revenueBreakdownChartInstance, 'revenueBreakdownChart', 'pie', revenueBreakdownData, revenueBreakdownOptions);

         // --- Sensitivity Comparison Chart --- (Data will be filled by analyzeSensitivityBtn click)
         const sensitivityComparisonData = {
            labels: ['Weekly Revenue', 'Weekly Profit', 'ROI (%)'],
             datasets: [
                 { label: 'Original', data: [0, 0, 0], backgroundColor: colors.backgroundColor[1], barPercentage: 0.5 },
                 { label: 'After Change', data: [0, 0, 0], backgroundColor: colors.backgroundColor[2], barPercentage: 0.5 }
             ]
         };
         const sensitivityComparisonOptions = {
             responsive: true, 
             maintainAspectRatio: false, 
             legend: { position: 'top' },
             scales: {
                 xAxes: [{
                     ticks: {
                         beginAtZero: true,
                         callback: function(value) {
                             return value.toLocaleString();
                         }
                     }
                 }],
                 yAxes: [{
                     gridLines: {
                         display: false
                     }
                 }]
             }
         };
         sensitivityComparisonChartInstance = initOrUpdateChart(sensitivityComparisonChartInstance, 'sensitivityComparisonChart', 'bar', sensitivityComparisonData, sensitivityComparisonOptions);
    };


    // --- Core Simulation Logic ---
     function runSimulation(overrideInputs = null) {
         const currentInputs = overrideInputs ? JSON.parse(JSON.stringify(overrideInputs)) : { // Deep copy overrides
            weeklyAdSpend: parseFloat(weeklyAdSpendInput.value) || 0,
            cpc: parseFloat(cpcInput.value) || 0.01,
            rates: {
                optin: (parseFloat(optinRateInput.value) || 0),
                attendance: (parseFloat(attendanceRateInput.value) || 0),
                coreConversion: (parseFloat(conversionCoreInput.value) || 0),
                bump: (parseFloat(conversionBumpInput.value) || 0),
                upsell: (parseFloat(conversionUpsellInput.value) || 0),
                downsell: (parseFloat(conversionDownsellInput.value) || 0),
                oto: (parseFloat(conversionOTOInput.value) || 0),
            },
            products: [...products], // Use global products
            expenses: [...expenses] // Use global expenses
         };
         if (currentInputs.cpc <= 0) currentInputs.cpc = 0.01;

         // Perform Calculations
         const calculatedVisitors = currentInputs.weeklyAdSpend / currentInputs.cpc;
         const optins = calculatedVisitors * (currentInputs.rates.optin / 100);
         const attendees = optins * (currentInputs.rates.attendance / 100);
         const coreCustomers = attendees * (currentInputs.rates.coreConversion / 100);

         // Helper to get product details
         const getProductDetail = (type, detail = 'price') => {
             const product = currentInputs.products.find(p => p.type === type);
             return product ? (product[detail] || 0) : 0;
         };

         // Calculate customers for each product type
         const bumpCustomers = coreCustomers * (currentInputs.rates.bump / 100);
         const upsellCustomers = coreCustomers * (currentInputs.rates.upsell / 100);
         const downsellCustomers = (coreCustomers - upsellCustomers) * (currentInputs.rates.downsell / 100); // Downsell applies to those who *didn't* take upsell
         const otoCustomers = coreCustomers * (currentInputs.rates.oto / 100); // Assuming OTO is offered to all core buyers

         // Calculate revenue per product type
         const revenueData = [
             { type: 'Main Offer', name: currentInputs.products.find(p => p.type === 'Main Offer')?.name || 'Main Offer', customers: coreCustomers, revenue: coreCustomers * getProductDetail('Main Offer', 'price') },
             { type: 'Order Bump', name: currentInputs.products.find(p => p.type === 'Order Bump')?.name || 'Order Bump', customers: bumpCustomers, revenue: bumpCustomers * getProductDetail('Order Bump', 'price') },
             { type: 'Upsell 1', name: currentInputs.products.find(p => p.type === 'Upsell 1')?.name || 'Upsell 1', customers: upsellCustomers, revenue: upsellCustomers * getProductDetail('Upsell 1', 'price') },
             { type: 'Downsell 1', name: currentInputs.products.find(p => p.type === 'Downsell 1')?.name || 'Downsell 1', customers: downsellCustomers, revenue: downsellCustomers * getProductDetail('Downsell 1', 'price') },
             { type: 'OTO', name: currentInputs.products.find(p => p.type === 'OTO')?.name || 'OTO', customers: otoCustomers, revenue: otoCustomers * getProductDetail('OTO', 'price') },
         ];
         const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);

         // Calculate Expenses
         const totalAdSpend = currentInputs.weeklyAdSpend;
         const totalOtherWeeklyExpenses = currentInputs.expenses.reduce((sum, expense) => {
             const amount = expense.amount || 0;
             switch (expense.frequency) {
                 case 'Weekly': return sum + amount;
                 case 'Monthly': return sum + (amount / (365.25 / 7 / 12)); // Avg weeks/month
                 case 'Annually': return sum + (amount / (365.25 / 7)); // Avg weeks/year
                 default: return sum;
             }
         }, 0);

         const totalProductCost = (coreCustomers * getProductDetail('Main Offer', 'cost')) +
                                  (bumpCustomers * getProductDetail('Order Bump', 'cost')) +
                                  (upsellCustomers * getProductDetail('Upsell 1', 'cost')) +
                                  (downsellCustomers * getProductDetail('Downsell 1', 'cost')) +
                                  (otoCustomers * getProductDetail('OTO', 'cost'));

         const totalExpenses = totalAdSpend + totalOtherWeeklyExpenses + totalProductCost;

         // Calculate Profit & ROI
         const netProfit = totalRevenue - totalExpenses;
         const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : (totalRevenue > 0 ? Infinity : 0); // Avoid division by zero

         // Return comprehensive results object
        return {
            inputs: currentInputs, // The inputs used for this simulation run
            flow: {
                visitors: calculatedVisitors,
                optins: optins,
                attendees: attendees,
                customers: coreCustomers // Base customers (core offer)
            },
            results: {
                revenue: totalRevenue,
                expenses: totalExpenses,
                profit: netProfit,
                roi: roi,
                adSpend: totalAdSpend,
                otherExpenses: totalOtherWeeklyExpenses,
                productCosts: totalProductCost
            },
            // Revenue breakdown for chart
            revenueBreakdown: revenueData.map(item => ({ name: item.name, revenue: item.revenue })),
            // Customer counts per *type* for product performance table
            customerCounts: revenueData.reduce((acc, item) => {
                acc[item.type] = item.customers;
                return acc;
            }, {})
        };
    }


    // --- Display Simulation Results ---
    function displaySimulationResults(data) {
        if (!data) return;
        lastSimulationResults = data; // Store the latest results globally

        // Funnel Flow Update
        flowVisitors.textContent = formatNumber(data.flow.visitors);
        flowOptins.textContent = formatNumber(data.flow.optins);
        flowAttendees.textContent = formatNumber(data.flow.attendees);
        flowCustomers.textContent = formatNumber(data.flow.customers);

        // Trigger Funnel Animation
        funnelVizContainer.classList.remove('funnel-visible');
        void funnelVizContainer.offsetWidth; // Force reflow
        funnelVizContainer.classList.add('funnel-visible');


        // Result Cards
        resultRevenue.textContent = formatCurrency(data.results.revenue); applyFinancialStyle(resultRevenue, data.results.revenue);
        resultExpenses.textContent = formatCurrency(data.results.expenses);
        resultProfit.textContent = formatCurrency(data.results.profit); applyFinancialStyle(resultProfit, data.results.profit);
        resultROI.textContent = isFinite(data.results.roi) ? formatPercent(data.results.roi) : 'INF%'; applyFinancialStyle(resultROI, data.results.profit >= 0); // Style ROI based on profit sign

        // Product Performance Table
         renderProductPerformanceTable(data);

         // Sensitivity "Current Values" - Update based on the simulation that just ran
         saCurrentSpend.textContent = formatCurrency(data.inputs.weeklyAdSpend);
         saCurrentCPC.textContent = formatCurrency(data.inputs.cpc);
         saCurrentVisitors.textContent = formatNumber(data.flow.visitors);
         saCurrentOptin.textContent = formatPercent(data.inputs.rates.optin);
         saCurrentAttendance.textContent = formatPercent(data.inputs.rates.attendance);
         saCurrentConv.textContent = formatPercent(data.inputs.rates.coreConversion);
         saCurrentBump.textContent = formatPercent(data.inputs.rates.bump);
         saCurrentUpsell.textContent = formatPercent(data.inputs.rates.upsell);
         saCurrentDownsell.textContent = formatPercent(data.inputs.rates.downsell);
         saCurrentOTO.textContent = formatPercent(data.inputs.rates.oto);

         // Charts - Update with the new data
         createCharts(data);

         // Re-run Dream Profit & Sensitivity based on new results
         if (calculateDreamProfitBtn) calculateDreamProfitBtn.click();
         if (analyzeSensitivityBtn) analyzeSensitivityBtn.click();
    }

    // --- Run Simulation and Update UI (Triggered by Button) ---
    function runSimulationAndDisplay() {
        try {
            updateCalculatedVisitors(); // Keep sidebar visitor count updated instantly
            if (!products.some(p => p.type === 'Main Offer')) {
                 alert("Please add a 'Main Offer' product in the Product Modal before simulating.");
                 return;
            }
            const simulationResults = runSimulation();
            displaySimulationResults(simulationResults);
        } catch (error) {
            console.error("Error during simulation or display:", error);
        }
    }


     // --- Product Performance Table Rendering ---
     function renderProductPerformanceTable(simulationData) {
         if (!simulationData || !simulationData.customerCounts) {
              productPerformanceTableContainer.innerHTML = '<p class="text-muted text-center">Run simulation to see performance.</p>';
              return;
         }

         let tableHTML = `
             <table class="table product-performance-table">
                 <thead>
                     <tr>
                         <th>Product</th>
                         <th>Type</th>
                         <th class="text-end">Price</th>
                         <th class="text-end">Cost</th>
                         <th class="text-end">Customers</th>
                         <th class="text-end">Revenue</th>
                     </tr>
                 </thead>
                 <tbody>
         `;

         if (products.length === 0) {
             tableHTML += '<tr><td colspan="6" class="text-center text-muted">No products defined.</td></tr>';
         } else {
             products.forEach(product => {
                 const customers = simulationData.customerCounts[product.type] || 0;
                 const revenue = customers * product.price;
                 const isPositive = revenue > 0;
                 const isNegative = revenue < 0; // Should usually not happen unless price is negative

                 tableHTML += `
                     <tr>
                         <td>${product.name}</td>
                         <td>${product.type}</td>
                         <td class="text-end">${formatCurrency(product.price)}</td>
                         <td class="text-end">${formatCurrency(product.cost)}</td>
                         <td class="text-end">${formatNumber(customers)}</td>
                         <td class="text-end revenue-value ${isPositive ? 'positive' : ''} ${isNegative ? 'negative' : ''}">${formatCurrency(revenue)}</td>
                     </tr>
                 `;
             });
         }

         tableHTML += `
                 </tbody>
             </table>
         `;
         productPerformanceTableContainer.innerHTML = tableHTML;
     }


     // --- Sensitivity Analysis Logic ---
     function highlightSAMetric(selectedValue) {
         sensitivityCurrentValueItems.forEach(item => {
             item.classList.remove('sa-active-metric');
             if (item.dataset.metric === selectedValue) {
                 item.classList.add('sa-active-metric');
             }
         });
     }
     saMetricSelect.addEventListener('change', (e) => highlightSAMetric(e.target.value));


     analyzeSensitivityBtn.addEventListener('click', () => {
         // Use the *last* simulation results as the baseline "original"
         const originalResults = lastSimulationResults || runSimulation(); // Run if no results exist yet

         const metricToVary = saMetricSelect.value;
         const variationValue = parseFloat(saVariationInput.value); // Get the value from input

         if (isNaN(variationValue)) {
            console.warn("Invalid variation value for Sensitivity Analysis.");
            // Clear 'After Change' and 'Difference' columns
            saAfterVisitors.textContent = '-'; saDiffVisitors.textContent = '-';
            saAfterRevenue.textContent = '-'; saDiffRevenue.textContent = '-';
            saAfterExpenses.textContent = '-'; saDiffExpenses.textContent = '-';
            saAfterProdCosts.textContent = '-'; saDiffProdCosts.textContent = '-';
            saAfterProfit.textContent = '-'; saDiffProfit.textContent = '-';
            saAfterROI.textContent = '-'; saDiffROI.textContent = '-';
            // Update chart with only original data
            if (sensitivityComparisonChartInstance) {
                 sensitivityComparisonChartInstance.data.datasets[1].data = [0, 0, 0]; // Zero out 'After Change'
                 sensitivityComparisonChartInstance.update();
            }
            return;
         }

         let variedInputs = JSON.parse(JSON.stringify(originalResults.inputs)); // Deep copy of inputs from original run
         const percentageMetrics = ['optin', 'attendance', 'conversionCore', 'conversionBump', 'conversionUpsell', 'conversionDownsell', 'conversionOTO'];

         // --- Determine the variation based on metric type ---
         if (percentageMetrics.includes(metricToVary)) {
             // For % rates, variationValue IS the NEW target percentage
             let rateKey;
             switch(metricToVary) {
                case 'optin': rateKey = 'optin'; break;
                case 'attendance': rateKey = 'attendance'; break;
                case 'conversionCore': rateKey = 'coreConversion'; break;
                case 'conversionBump': rateKey = 'bump'; break;
                case 'conversionUpsell': rateKey = 'upsell'; break;
                case 'conversionDownsell': rateKey = 'downsell'; break;
                case 'conversionOTO': rateKey = 'oto'; break;
             }
             if (rateKey) {
                 // Set the rate directly to the input value, clamped between 0 and 100
                variedInputs.rates[rateKey] = Math.max(0, Math.min(100, variationValue));
             }
         } else {
             // For non-% metrics (spend, cpc), variationValue is a percentage CHANGE
             const factor = 1 + variationValue / 100;
             if (metricToVary === 'weeklyAdSpend') {
                 variedInputs.weeklyAdSpend = Math.max(0, originalResults.inputs.weeklyAdSpend * factor); // Apply change to original value
             } else if (metricToVary === 'cpc') {
                 variedInputs.cpc = Math.max(0.01, originalResults.inputs.cpc * factor); // Apply change to original value, min $0.01
             }
         }


         const afterResults = runSimulation(variedInputs);

         // --- Update Sensitivity Table ---
         // Visitors Row
         saOrigVisitors.textContent = formatNumber(originalResults.flow.visitors);
         saAfterVisitors.textContent = formatNumber(afterResults.flow.visitors);
         let diff = calculateDifference(originalResults.flow.visitors, afterResults.flow.visitors);
         saDiffVisitors.textContent = `${formatNumber(diff.absolute, 0)} ${diff.percentString}`;
         applyFinancialStyle(saDiffVisitors, diff.absolute, true);
         // Revenue Row
         saOrigRevenue.textContent = formatCurrency(originalResults.results.revenue);
         saAfterRevenue.textContent = formatCurrency(afterResults.results.revenue);
         diff = calculateDifference(originalResults.results.revenue, afterResults.results.revenue);
         saDiffRevenue.textContent = `${formatCurrency(diff.absolute)} ${diff.percentString}`;
         applyFinancialStyle(saDiffRevenue, diff.absolute, true);
         // Expenses Row
         saOrigExpenses.textContent = formatCurrency(originalResults.results.expenses);
         saAfterExpenses.textContent = formatCurrency(afterResults.results.expenses);
         diff = calculateDifference(originalResults.results.expenses, afterResults.results.expenses);
         saDiffExpenses.textContent = `${formatCurrency(diff.absolute)} ${diff.percentString}`;
         applyFinancialStyle(saDiffExpenses, diff.absolute, true); // Color based on *change* in expenses
         // Product Costs Row
         saOrigProdCosts.textContent = formatCurrency(originalResults.results.productCosts);
         saAfterProdCosts.textContent = formatCurrency(afterResults.results.productCosts);
         diff = calculateDifference(originalResults.results.productCosts, afterResults.results.productCosts);
         saDiffProdCosts.textContent = `${formatCurrency(diff.absolute)} ${diff.percentString}`;
         applyFinancialStyle(saDiffProdCosts, diff.absolute, true); // Color based on *change* in costs
         // Profit Row
         saOrigProfit.textContent = formatCurrency(originalResults.results.profit);
         saAfterProfit.textContent = formatCurrency(afterResults.results.profit);
         diff = calculateDifference(originalResults.results.profit, afterResults.results.profit);
         saDiffProfit.textContent = `${formatCurrency(diff.absolute)} ${diff.percentString}`;
         applyFinancialStyle(saDiffProfit, diff.absolute, true);
         // ROI Row
         const origROIValue = isFinite(originalResults.results.roi) ? originalResults.results.roi : 0;
         const afterROIValue = isFinite(afterResults.results.roi) ? afterResults.results.roi : 0;
         saOrigROI.textContent = isFinite(originalResults.results.roi) ? formatPercent(originalResults.results.roi) : 'INF%';
         saAfterROI.textContent = isFinite(afterResults.results.roi) ? formatPercent(afterResults.results.roi) : 'INF%';
         diff = calculateDifference(origROIValue, afterROIValue); // % change of ROI value itself
         const roiAbsDiff = afterROIValue - origROIValue; // Absolute percentage point difference
         saDiffROI.textContent = `${(roiAbsDiff >= 0 ? '+' : '')}${roiAbsDiff.toFixed(2)}% ${diff.percentString}`; // Show abs point change and % change of the ROI number
         applyFinancialStyle(saDiffROI, roiAbsDiff, true);

         // --- Update Sensitivity Comparison Chart ---
         if (sensitivityComparisonChartInstance) {
            sensitivityComparisonChartInstance.data.datasets[0].data = [
                originalResults.results.revenue, originalResults.results.profit, origROIValue
            ];
            sensitivityComparisonChartInstance.data.datasets[1].data = [
                 afterResults.results.revenue, afterResults.results.profit, afterROIValue
            ];
            // For Chart.js v2, update the scale callback
            if (sensitivityComparisonChartInstance.options.scales && 
                sensitivityComparisonChartInstance.options.scales.xAxes && 
                sensitivityComparisonChartInstance.options.scales.xAxes[0] &&
                sensitivityComparisonChartInstance.options.scales.xAxes[0].ticks) {
                sensitivityComparisonChartInstance.options.scales.xAxes[0].ticks.callback = function(v) {
                    return metricToVary === 'roi' ? v.toFixed(1)+'%' : formatCurrency(v);
                };
            }
            sensitivityComparisonChartInstance.update();
         }
     });

     // --- Dream Profit Goal Logic ---
     calculateDreamProfitBtn.addEventListener('click', function() {
         console.log('Calculate Dream Profit button clicked');
         const annualGoal = parseFloat(dreamProfitInput.value) || 0;
         console.log('Annual goal:', annualGoal);
         if (dpgHeaderAmount) dpgHeaderAmount.textContent = formatCurrency(annualGoal);

         // Use the *last* simulation results as the basis
         const currentSim = lastSimulationResults || runSimulation(); // Run if needed

         const currentWeeklyProfit = currentSim.results.profit;
         const weeksPerYear = 365.25 / 7;
         const currentAnnualProfit = currentWeeklyProfit * weeksPerYear;

         let scaleFactor = 0; // Default to 0 if goal cannot be reached or not profitable
         if (currentAnnualProfit > 0 && annualGoal > 0) {
             scaleFactor = annualGoal / currentAnnualProfit;
         } else if (annualGoal <= 0) {
             scaleFactor = 0; // No scaling if goal is zero or negative
         } else {
             // Current profit is <= 0, but goal is > 0. Cannot scale.
             scaleFactor = 0; // Show 0s
             console.warn("Dream Profit: Cannot calculate requirements from zero/negative current profit.");
         }

         // Calculate required *inputs* based on scaling factor
         const reqWeeklyVisitors = currentSim.flow.visitors * scaleFactor;
         const reqCpc = currentSim.inputs.cpc; // Assume CPC stays the same
         const reqWeeklyAdSpend = reqWeeklyVisitors * reqCpc;

         // Simulate with the *required* weekly ad spend to get corresponding outputs
         let dreamInputs = JSON.parse(JSON.stringify(currentSim.inputs));
         dreamInputs.weeklyAdSpend = reqWeeklyAdSpend; // Override ad spend

         const dreamSim = runSimulation(dreamInputs); // Run simulation with required spend

         // Extract results from the simulation based on the *required* inputs
         const reqWeeklyRevenue = dreamSim.results.revenue;
         const reqWeeklyProfit = dreamSim.results.profit; // This should be close to annualGoal / weeksPerYear
         const reqWeeklyLeads = dreamSim.flow.optins;
         // Note: reqWeeklyVisitors was calculated above, dreamSim.flow.visitors should match it

         // Calculate all timeframes
         const weeksPerMonth = weeksPerYear / 12;

         // Helper function for safely updating elements
         const safeUpdateElement = (elementId, value) => {
             const element = document.getElementById(elementId);
             if (element) {
                 element.textContent = value;
                 return element;
             }
             return null;
         };
         
         // Safe apply financial style
         const safeApplyStyle = (elementId, value) => {
             const element = document.getElementById(elementId);
             if (element) {
                 applyFinancialStyle(element, value);
             }
         };
         
         // Revenue
         const reqYearRevenue = reqWeeklyRevenue * weeksPerYear;
         safeUpdateElement('dpgYearRevenue', formatCurrency(reqYearRevenue));
         safeUpdateElement('dpgMonthRevenue', formatCurrency(reqYearRevenue / 12));
         safeUpdateElement('dpgWeekRevenue', formatCurrency(reqWeeklyRevenue));
         safeUpdateElement('dpgDayRevenue', formatCurrency(reqYearRevenue / 365.25));
         safeApplyStyle('dpgDayRevenue', reqYearRevenue);
         safeApplyStyle('dpgWeekRevenue', reqYearRevenue);
         safeApplyStyle('dpgMonthRevenue', reqYearRevenue);
         safeApplyStyle('dpgYearRevenue', reqYearRevenue);

         // Profit
         const reqYearProfit = reqWeeklyProfit * weeksPerYear; // Should be ~ annualGoal
         safeUpdateElement('dpgYearProfit', formatCurrency(reqYearProfit));
         safeUpdateElement('dpgMonthProfit', formatCurrency(reqYearProfit / 12));
         safeUpdateElement('dpgWeekProfit', formatCurrency(reqWeeklyProfit));
         safeUpdateElement('dpgDayProfit', formatCurrency(reqYearProfit / 365.25));
         safeApplyStyle('dpgDayProfit', reqYearProfit);
         safeApplyStyle('dpgWeekProfit', reqYearProfit);
         safeApplyStyle('dpgMonthProfit', reqYearProfit);
         safeApplyStyle('dpgYearProfit', reqYearProfit);

         // Visitors (Traffic) - Use the value calculated from scaling
         const reqYearTraffic = reqWeeklyVisitors * weeksPerYear;
         safeUpdateElement('dpgYearTraffic', formatNumber(reqYearTraffic));
         safeUpdateElement('dpgMonthTraffic', formatNumber(reqYearTraffic / 12));
         safeUpdateElement('dpgWeekTraffic', formatNumber(reqWeeklyVisitors));
         safeUpdateElement('dpgDayTraffic', formatNumber(reqYearTraffic / 365.25));

         // Cost (Ad Spend) - Use the required ad spend calculated
         const reqYearCost = reqWeeklyAdSpend * weeksPerYear;
         safeUpdateElement('dpgYearCost', formatCurrency(reqYearCost));
         safeUpdateElement('dpgMonthCost', formatCurrency(reqYearCost / 12));
         safeUpdateElement('dpgWeekCost', formatCurrency(reqWeeklyAdSpend));
         safeUpdateElement('dpgDayCost', formatCurrency(reqYearCost / 365.25));

         // Leads (Registrations) - Use the result from the dream simulation
         const reqYearLeads = reqWeeklyLeads * weeksPerYear;
         safeUpdateElement('dpgYearLeads', formatNumber(reqYearLeads));
         safeUpdateElement('dpgMonthLeads', formatNumber(reqYearLeads / 12));
         safeUpdateElement('dpgWeekLeads', formatNumber(reqWeeklyLeads));
         safeUpdateElement('dpgDayLeads', formatNumber(reqYearLeads / 365.25));
     });


    // --- Sidebar Input Listeners ---
     function updateCalculatedVisitors() {
         const spend = parseFloat(weeklyAdSpendInput.value) || 0;
         const cpc = parseFloat(cpcInput.value) || 0.01;
         const visitors = (cpc > 0) ? Math.round(spend / cpc) : 0;
         weeklyVisitorsInput.value = visitors;
         // NOTE: This only updates the display. Full recalculation happens on Simulate click.
     }
     // Update visitor calculation display immediately on input
     weeklyAdSpendInput.addEventListener('input', updateCalculatedVisitors);
     cpcInput.addEventListener('input', updateCalculatedVisitors);


     // --- Modal: Expenses ---
     const expenseModalElement = document.getElementById('expenseModal');
     const expenseForm = document.getElementById('addExpenseForm');
     const expenseNameInput = document.getElementById('expenseName');
     const expenseAmountInput = document.getElementById('expenseAmount');
     const expenseFrequencyInput = document.getElementById('expenseFrequency');
     const currentExpensesList = document.getElementById('currentExpensesList');
     const noOtherExpensesText = document.getElementById('noOtherExpensesText');
     const editExpenseIdInput = document.getElementById('editExpenseId');
     const addExpenseBtn = document.getElementById('addExpenseBtn');
     const cancelEditExpenseBtn = document.getElementById('cancelEditExpenseBtn');

     function renderExpenses() {
         currentExpensesList.innerHTML = '';
         let hasOtherExpenses = false;
         // Get current Ad Spend directly from input for display in modal
         const adSpend = parseFloat(weeklyAdSpendInput.value) || 0;
         const adSpendItem = document.createElement('div');
         adSpendItem.className = 'list-group-item readonly-item';
         adSpendItem.innerHTML = `
             <div class="item-details"><strong>Weekly Advertising</strong><span>${formatCurrency(adSpend)} | Weekly (Auto)</span></div>
             <div class="item-actions"></div>`;
         currentExpensesList.appendChild(adSpendItem);
         // Add other expenses
         expenses.forEach(exp => {
            hasOtherExpenses = true;
             const item = document.createElement('div'); item.className = 'list-group-item'; item.dataset.id = exp.id;
             item.innerHTML = `<div class="item-details"><strong>${exp.name}</strong><span>${formatCurrency(exp.amount)} | ${exp.frequency}</span></div><div class="item-actions"><button class="btn btn-sm btn-outline-primary me-1 btn-edit-expense"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-outline-danger btn-delete-expense"><i class="fas fa-trash"></i></button></div>`;
             currentExpensesList.appendChild(item);
         });
         noOtherExpensesText.style.display = hasOtherExpenses ? 'none' : 'block';
         currentExpensesList.querySelectorAll('.btn-edit-expense').forEach(btn => btn.addEventListener('click', handleEditExpense));
         currentExpensesList.querySelectorAll('.btn-delete-expense').forEach(btn => btn.addEventListener('click', handleDeleteExpense));
    }
    expenseForm.addEventListener('submit', (e) => {
         e.preventDefault(); const id = editExpenseIdInput.value;
         const expenseData = { id: id ? parseInt(id) : Date.now(), name: expenseNameInput.value.trim(), amount: parseFloat(expenseAmountInput.value) || 0, frequency: expenseFrequencyInput.value };
         if (!expenseData.name || expenseData.amount <= 0) { alert('Please provide a valid name and positive amount.'); return; }
         if (id) { expenses = expenses.map(exp => exp.id === expenseData.id ? expenseData : exp); } else { expenses.push(expenseData); }
         renderExpenses(); resetExpenseForm();
         // DO NOT runSimulationAndDisplay() automatically here. User must click Simulate.
    });
     function handleEditExpense(e) {
        const item = e.target.closest('.list-group-item'); const id = parseInt(item.dataset.id); const expense = expenses.find(exp => exp.id === id);
        if (expense) { editExpenseIdInput.value = expense.id; expenseNameInput.value = expense.name; expenseAmountInput.value = expense.amount; expenseFrequencyInput.value = expense.frequency; addExpenseBtn.textContent = 'Update Expense'; cancelEditExpenseBtn.style.display = 'block'; }
    }
     function handleDeleteExpense(e) {
        const item = e.target.closest('.list-group-item'); const id = parseInt(item.dataset.id);
        if (confirm(`Are you sure you want to delete this expense?`)) { expenses = expenses.filter(exp => exp.id !== id); renderExpenses(); /* DO NOT run simulation */ }
    }
     function resetExpenseForm() {
        editExpenseIdInput.value = ''; expenseForm.reset(); addExpenseBtn.textContent = 'Add Expense'; cancelEditExpenseBtn.style.display = 'none';
    }
     cancelEditExpenseBtn.addEventListener('click', resetExpenseForm);
     expenseModalElement.addEventListener('show.bs.modal', renderExpenses);
     expenseModalElement.addEventListener('hidden.bs.modal', resetExpenseForm);

     // --- Modal: Products ---
     const productModalElement = document.getElementById('productModal');
     const productForm = document.getElementById('addProductForm');
     const productNameInput = document.getElementById('productName');
     const productTypeInput = document.getElementById('productType');
     const productPriceInput = document.getElementById('productPrice');
     const productCostInput = document.getElementById('productCost');
     const currentProductsList = document.getElementById('currentProductsList');
     const noProductsText = document.getElementById('noProductsText');
     const editProductIdInput = document.getElementById('editProductId');
     const addProductBtn = document.getElementById('addProductBtn');
     const cancelEditProductBtn = document.getElementById('cancelEditProductBtn');

     function renderProducts() {
        currentProductsList.innerHTML = '';
        products.forEach(prod => {
            const item = document.createElement('div'); item.className = 'list-group-item'; item.dataset.id = prod.id;
            item.innerHTML = `<div class="item-details"><strong>${prod.name} (${prod.type})</strong><span>Price: ${formatCurrency(prod.price)} | Cost: ${formatCurrency(prod.cost)}</span></div><div class="item-actions"><button class="btn btn-sm btn-outline-primary me-1 btn-edit-product"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-outline-danger btn-delete-product"><i class="fas fa-trash"></i></button></div>`;
            currentProductsList.appendChild(item);
        });
        noProductsText.style.display = products.length === 0 ? 'block' : 'none';
        currentProductsList.querySelectorAll('.btn-edit-product').forEach(btn => btn.addEventListener('click', handleEditProduct));
        currentProductsList.querySelectorAll('.btn-delete-product').forEach(btn => btn.addEventListener('click', handleDeleteProduct));
     }
     productForm.addEventListener('submit', (e) => {
         e.preventDefault(); const id = editProductIdInput.value;
         const productData = { id: id ? parseInt(id) : Date.now(), name: productNameInput.value.trim(), type: productTypeInput.value, price: parseFloat(productPriceInput.value) || 0, cost: parseFloat(productCostInput.value) || 0 };
         if (!productData.name || !productData.type || productData.price < 0 || productData.cost < 0) { alert('Please provide a valid name, type, and non-negative price/cost.'); return; }
         const isEditing = !!id;
         // Check for duplicate *type* only when adding a new product or changing type (which is now disabled during edit)
         const existingProductOfSameType = products.find(p => p.type === productData.type && p.id !== productData.id);
         if (!isEditing && existingProductOfSameType) { // Check only on add
              alert(`A product of type '${productData.type}' already exists. You can only have one product per type. Edit the existing one or delete it first.`);
              return;
         }

         if (isEditing) { products = products.map(prod => prod.id === productData.id ? productData : prod); } else { products.push(productData); }
         renderProducts(); resetProductForm();
         // DO NOT runSimulationAndDisplay() automatically here.
     });
     function handleEditProduct(e) {
        const item = e.target.closest('.list-group-item'); const id = parseInt(item.dataset.id); const product = products.find(prod => prod.id === id);
        if (product) { editProductIdInput.value = product.id; productNameInput.value = product.name; productTypeInput.value = product.type; productPriceInput.value = product.price; productCostInput.value = product.cost; addProductBtn.textContent = 'Update Product'; cancelEditProductBtn.style.display = 'block'; productTypeInput.disabled = true; /* Prevent changing type during edit */ }
    }
     function handleDeleteProduct(e) {
        const item = e.target.closest('.list-group-item'); const id = parseInt(item.dataset.id); const product = products.find(prod => prod.id === id);
        if (product && confirm(`Are you sure you want to delete product "${product.name}"?`)) { products = products.filter(prod => prod.id !== id); renderProducts(); /* DO NOT run simulation */ }
    }
      function resetProductForm() {
        editProductIdInput.value = ''; productForm.reset(); productCostInput.value = 0; addProductBtn.textContent = 'Add Product'; cancelEditProductBtn.style.display = 'none'; productTypeInput.disabled = false; /* Re-enable type for adding */
    }
     cancelEditProductBtn.addEventListener('click', resetProductForm);
     productModalElement.addEventListener('show.bs.modal', renderProducts);
     productModalElement.addEventListener('hidden.bs.modal', resetProductForm);

     // --- Scroll-to-Top Button Logic ---
     window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) { scrollTopBtn.style.display = 'flex'; } else { scrollTopBtn.style.display = 'none'; } });
     scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' }); });


    // --- Navbar Buttons ---
    document.getElementById('simulateBtn').addEventListener('click', function() {
        console.log('Simulate button clicked');
        runSimulationAndDisplay(); // The ONLY place this is called automatically after load
        const btn = this; btn.disabled = true; // Briefly disable
        btn.innerHTML = '<i class="fas fa-check"></i> Simulated!';
        setTimeout(() => { btn.innerHTML = '<i class="fas fa-play me-1"></i> Simulate'; btn.disabled = false; }, 1500);
    });
    document.getElementById('pdfBtn').addEventListener('click', function() {
        alert('PDF Export functionality requires additional libraries (like jsPDF & html2canvas) and is not fully implemented in this basic version.');
        console.log('PDF Export clicked (Placeholder)');
         // Future implementation: Use jsPDF / html2canvas to capture relevant sections
    });
    document.getElementById('excelBtn').addEventListener('click', function() {
         alert('Excel Export functionality requires additional libraries (like SheetJS/xlsx) and is not fully implemented in this basic version.');
         console.log('Excel Export clicked (Placeholder)');
         // Future implementation: Gather data from lastSimulationResults, format, and use SheetJS to generate Blob/download.
    });


    // --- Initial Setup ---
    applyDarkModePreference(); // Apply dark mode first
    updateCalculatedVisitors(); // Calc initial visitors display
    renderProductPerformanceTable(null); // Render empty table structure initially
    highlightSAMetric(saMetricSelect.value); // Highlight initial SA metric
    createCharts(); // Initialize charts with empty/default data and correct theme colors

    // Calculate initial Dream Profit & Sensitivity based on default inputs (or 0s if no initial run)
     if (calculateDreamProfitBtn) calculateDreamProfitBtn.click();
     if (analyzeSensitivityBtn) analyzeSensitivityBtn.click();

}); // End DOMContentLoaded