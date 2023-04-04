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
        page_div.classList = "center"
        page_div.style.display = "none"
        this.page_arr.push(page_name)
        document.body.appendChild(page_div)

    },

    start_page: function () {

        this.create_page_div("start_page")
        const page_div = document.getElementById("start_page")

        const title = document.createElement("h1")
        title.innerHTML = "EducateHacks: Note-Taking Tracker"
        page_div.appendChild(title)

        const enter_btn = document.createElement("button")
        enter_btn.innerHTML = "Enter a code"
        enter_btn.classList = "celestial"
        enter_btn.onclick = function () { pages.active_page("enter_page") }
        page_div.appendChild(enter_btn)

        const create_btn = document.createElement("button")
        create_btn.innerHTML = "Create a code"
        create_btn.classList = "emerald"
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
        enter_btn.classList = "celestial"

        enter_btn.onclick = function () {
            var entry_code = code_input.value
            database.ref().child(entry_code).get().then((result) => {
                // If the room doesn't exist, there should be an alert
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
        textarea.placeholder = "Type your notes here!"
        page_div.appendChild(textarea)

        const btn_names = ["Repeat ⟳", "Slow down ↓", "Elaborate 🛈"]
        const btn_ids = ["repeat", "slow_down", "elaborate"]
        const btn_colors = ["orange", "bittersweet", "celestial"]

        for (i = 0; i < 3; i++) {
            var btn = document.createElement("button")
            btn.innerHTML = btn_names[i]
            btn.id = btn_ids[i]
            btn.classList = btn_colors[i]
            page_div.appendChild(btn)
        }

        var student_ref = database.ref(`${room_code}/students/${student_code}`)

        btn_ids.forEach((e) => {

            var btn = document.getElementById(e)
            var update_obj = {}

            btn.onclick = function () {

                btn.disabled = true
                console.log(btn)
                // Property that correpsonds to button's id is set to true in student object
                // E.g., repeat: true
                update_obj[e] = true
                console.log(e, update_obj)

                student_ref.update(update_obj)

                function set_false() {

                    update_obj[e] = false
                    student_ref.update(update_obj)
                    btn.disabled = false;
                }

                setTimeout(set_false, 5000)

            }
        })

        var timer
        textarea.addEventListener("keydown", function () {

            window.clearTimeout(timer)
            student_ref.update({ is_typing: true })

            function set_typing_false() {
                student_ref.update({ is_typing: false })
            }
            timer = setTimeout(set_typing_false, 1000)

        })

        // If teacher-created room disappears, there should be some sort of notification
        window.onbeforeunload = (e) => {
            student_ref.remove()
        }

    },

    teacher_page: function () {

        this.create_page_div("teacher_page")
        const page_div = document.getElementById("teacher_page")

        const code = generate_code()
        const p_code = document.createElement("p")
        p_code.innerHTML = `Room code: ${code}`
        page_div.appendChild(p_code)

        const room_ref = database.ref("/" + code)

        room_ref.set({
            students: {},
            code: code,
        })

        const info_arr = ["students_typing", "students_repeat", "students_slow_down", "students_elaborate"]

        for (i = 0; i < 4; i++) {
            var p = document.createElement("p")
            p.id = info_arr[i]
            page_div.appendChild(p)
        }

        const no_students = document.createElement("p")
        no_students.innerHTML = "No students are connected."
        page_div.appendChild(no_students)

        room_ref.on('value', (snapshot) => {

            room_ref.child("students").get().then((result) => {

                if (result.exists()) {

                    var room_obj = snapshot.val()
                    var student_obj = room_obj["students"]
                    var total_students = Object.keys(student_obj).length
                    var students_typing = students_repeat = students_slow_down = students_elaborate = 0
                    var typing_status = repeat_status = slow_status = elaborate_status = "✓"

                    info_arr.forEach(e => {
                        document.getElementById(e).classList = "display_info emerald"
                    })

                    for (student in student_obj) {
                        if (student_obj[student]["is_typing"]) {
                            students_typing = + 1
                            typing_status = "✗"
                            document.getElementById("students_typing").classList.replace("emerald", "rebecca")
                        }
                    }

                    for (student in student_obj) {
                        if (student_obj[student]["repeat"]) {
                            students_repeat = + 1
                            repeat_status = "✗"
                            document.getElementById("students_repeat").classList.replace("emerald", "orange")
                        }
                    }

                    for (student in student_obj) {
                        if (student_obj[student]["slow_down"]) {
                            students_slow_down = + 1
                            slow_status = "✗"
                            document.getElementById("students_slow_down").classList.replace("emerald", "bittersweet")
                        }
                    }

                    for (student in student_obj) {
                        if (student_obj[student]["elaborate"]) {
                            students_elaborate = + 1
                            elaborate_status = "✗"
                            document.getElementById("students_elaborate").classList.replace("emerald", "celestial")
                        }
                    }

                    info_arr.forEach((e) => {
                        document.getElementById(e).style.display = "block"
                    })
                    no_students.style.display = "none"

                    document.getElementById("students_typing").innerHTML = `${typing_status} ${students_typing}/${total_students} are typing`
                    document.getElementById("students_elaborate").innerHTML = `${elaborate_status} ${students_elaborate}/${total_students} want elaboration`
                    document.getElementById("students_slow_down").innerHTML = `${slow_status} ${students_slow_down}/${total_students} want a slower pace`
                    document.getElementById("students_repeat").innerHTML = `${repeat_status} ${students_repeat}/${total_students} want repetition`

                } else {

                    info_arr.forEach((e) => {
                        document.getElementById(e).style.display = "none"
                    })
                    no_students.style.display = "block"

                }
            })
        })

        window.onbeforeunload = (e) => {
            room_ref.remove()
        }

    },

}

pages.active_page("start_page")


