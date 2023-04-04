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


function generate_code() {

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var result = ''
    for (i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result

}


const pages = {

    active_page: function (page_name, student_code, room_code) {
        this[page_name](student_code, room_code)
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
        enter_btn.onclick = function () { pages.active_page("enter_page") }
        page_div.appendChild(enter_btn)

        const create_btn = document.createElement("button")
        create_btn.innerHTML = "Create a code"
        create_btn.onclick = function () { pages.active_page("teacher_page") }
        page_div.appendChild(create_btn)

    },

    enter_page: function () {

        this.create_page_div("enter_page")
        const page_div = document.getElementById("enter_page")

        const code_input = document.createElement("input")
        code_input.placeholder = "Enter a code"
        page_div.appendChild(code_input)

        const enter_btn = document.createElement("button")
        page_div.appendChild(enter_btn)
        enter_btn.innerHTML = "Enter"

        enter_btn.onclick = function () {
            var entry_code = code_input.value
            database.ref().child(entry_code).get().then((result) => {
                if (result.exists()) {
                    var student_code = generate_code()
                    database.ref(`${entry_code}/students/${student_code}`).set({
                        repeat: false,
                        slow_down: false,
                        elaborate: false,
                        is_typing: false,
                    })
                    pages.active_page("student_page", student_code, entry_code)
                } else {
                    console.log("Code does not exist")
                }
            }).catch((err) => {
                console.log(err)
            })
        }

    },

    student_page: function (student_code, room_code) {
        this.create_page_div("student_page")
        const page_div = document.getElementById("student_page")

        const textarea = document.createElement("textarea")
        page_div.appendChild(textarea)

        const btn_names = ["Repeat", "Slow down", "Elaborate"]
        const btn_ids = ["repeat", "slow_down", "elaborate"]

        for (i = 0; i < 3; i++) {
            var btn = document.createElement("button")
            btn.innerHTML = btn_names[i]
            btn.id = btn_ids[i]
            page_div.appendChild(btn)
        }

        btn_ids.forEach((e) => {

            var btn = document.getElementById(e)
            var update_obj = {}

            btn.onclick = function () {

                // Property that correpsonds to button's id is set to true in student object
                // E.g., repeat: true
                update_obj[e] = true
                console.log(e, update_obj)

                database.ref(`${room_code}/students/${student_code}`).update(update_obj)

                function set_false() {
                    update_obj[e] = false
                    database.ref(`${room_code}/students/${student_code}`).update(update_obj)
                }

                setTimeout(set_false, 10000)

            }
        })

        var timer
        textarea.addEventListener("keydown", function () {
            window.clearTimeout(timer)
            database.ref(`${room_code}/students/${student_code}`).update({ is_typing: true })

            function set_typing_false() {
                database.ref(`${room_code}/students/${student_code}`).update({ is_typing: false })
            }
            timer = setTimeout(set_typing_false, 500)

        })

    },

    teacher_page: function () {

        this.create_page_div("teacher_page")
        const page_div = document.getElementById("teacher_page")

        const code = generate_code()
        const p_code = document.createElement("p")
        p_code.innerHTML = code
        page_div.appendChild(p_code)

        const room = database.ref("/" + code)

        room.set({
            students: {},
            code: code,
        })

        var p_students_typing = document.createElement("p")
        page_div.appendChild(p_students_typing)

        room.on('value', (snapshot) => {
            var room_obj = snapshot.val()
            var student_obj = room_obj["students"]
            var total_students = Object.keys(student_obj).length
            var students_typing = 0
            for (student in student_obj) {
                if (student_obj[student]["is_typing"]) {
                    students_typing = + 1
                }
            }
            p_students_typing.innerHTML = `${students_typing}/${total_students} students typing`
        })

    },

}

pages.active_page("start_page")


