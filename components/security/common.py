from flask import request, render_template


def create_test_processing(context, slot, payload):
    return render_template(
        f"theme:security/app/create_test_processing.html",
        config=payload
    )
