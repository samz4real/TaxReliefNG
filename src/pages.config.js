import BusinessToolkit from './pages/BusinessToolkit';
import ExemptionChecker from './pages/ExemptionChecker';
import FinancialAccounts from './pages/FinancialAccounts';
import Forum from './pages/Forum';
import Guides from './pages/Guides';
import Home from './pages/Home';
import NewsFeed from './pages/NewsFeed';
import TaxCalculator from './pages/TaxCalculator';
import TaxHistory from './pages/TaxHistory';
import TaxPlanning from './pages/TaxPlanning';
import Transactions from './pages/Transactions';
import __Layout from './Layout.jsx';


export const PAGES = {
    "BusinessToolkit": BusinessToolkit,
    "ExemptionChecker": ExemptionChecker,
    "FinancialAccounts": FinancialAccounts,
    "Forum": Forum,
    "Guides": Guides,
    "Home": Home,
    "NewsFeed": NewsFeed,
    "TaxCalculator": TaxCalculator,
    "TaxHistory": TaxHistory,
    "TaxPlanning": TaxPlanning,
    "Transactions": Transactions,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};