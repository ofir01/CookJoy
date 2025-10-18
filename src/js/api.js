
//שמות של שחקנים או חיפוש שחקן
export async function API_people() {
    try {
        const res = await fetch(`https://swapi.info/api/people`);
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("שגיאה ב-fetch:", error);
        return null;
    }
}



// מציאת שחקן מסוים
export async function API_people_url(url) {
    try {
        const res = await fetch(url);
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("שגיאה ב-fetch:", error);
        return null;
    }
}



//הסרטים שבהם שיחק
export async function API_films(element) {
    try {
        const res = await fetch(element);
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("שגיאה ב-fetch:", error);
        return null;
    }
}


//שחקנים בסרט
export async function API_peoples(element) {

    try {
        const res = await fetch(element);
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("שגיאה ב-fetch:", error);
        return null;
    }
}



