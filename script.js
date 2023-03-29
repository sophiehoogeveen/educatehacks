const firebaseConfig = {
    apiKey: "AIzaSyDv1l_dlz88GLmtb7GpSBkk-HoisTcIvT4",
    authDomain: "educatehacks-447af.firebaseapp.com",
    databaseURL: "https://educatehacks-447af-default-rtdb.firebaseio.com",
    projectId: "educatehacks-447af",
    storageBucket: "educatehacks-447af.appspot.com",
    messagingSenderId: "601188330660",
    appId: "1:601188330660:web:d18317cb8376e56f1a4a31",
    measurementId: "G-52EPNCNE2Q"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const pages = {

    active_page: function (page_name) {
        var page = document.getElementById(page_name)
        page.style.display = "block"
        this.page_arr.forEach(e => {
            if (e != page_name) {
                document.getElementById(e).style.display = "none"
            }
        })

    },

    page_arr: new Array(),

    create_page_div: function (page_name) {

        const page_div = document.createElement("div")
        page_div.id = page_name
        page_div.style.display = "none"
        this.page_arr.push(page_name)
        document.body.appendChild(page_div)

    },

    start_page: function () {

        this.create_page_div("start_page")
        const page_div = document.getElementById("start_page")

        const enter_btn = document.createElement("button")
        enter_btn.innerHTML = "Enter a code"
        enter_btn.onclick = function () { pages.active_page("student_page") }
        page_div.appendChild(enter_btn)

        const create_btn = document.createElement("button")
        create_btn.innerHTML = "Create a code"
        create_btn.onclick = function () { pages.active_page("teacher_page") }
        page_div.appendChild(create_btn)

    },

    student_page: function () {

        this.create_page_div("student_page")
        const page_div = document.getElementById("student_page")

        const code_input = document.createElement("input")
        page_div.appendChild(code_input)

    },

    teacher_page: function () {

        this.create_page_div("teacher_page")
        const page_div = document.getElementById("teacher_page")

        function generate_code() {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            var result = ''
            for (i = 0; i < 6; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result
        }

        const code = generate_code()
        const p = document.createElement("p")
        p.innerHTML = code
        page_div.appendChild(p)

        database.ref("/" + code).set({
            foo: "bar",
        })

    },

    init: function () {

        this.start_page()
        this.student_page()
        this.teacher_page()

    }

}

pages.init()
console.log(pages.page_arr)
pages.active_page("start_page")


