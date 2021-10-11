from flask import render_template
# from pylon.core.tools import log  # pylint: disable=E0611,E0401
#
#
# def applications_scanners_config(context, slot, payload):
#     if not context.slot_manager.callbacks.get("security_scanners"):
#         log.warning("No scanners for security application were installed")
#         return render_template(
#             f"security/app/application-scanners.html",
#             config=payload
#         )
#     context.slot_manager.callbacks["left_col_scanners"] = (
#         context.slot_manager.callbacks["security_scanners"][
#             :
#             len(context.slot_manager.callbacks["security_scanners"]) // 2
#         ]
#     )
#     context.slot_manager.callbacks["right_col_scanners"] = (
#         context.slot_manager.callbacks["security_scanners"][
#             len(context.slot_manager.callbacks["security_scanners"]) // 2:
#         ]
#     )
#
#     payload['scanners'] = "security_scanners"
#     payload["right_scanners"] = "right_col_scanners"
#     payload["left_scanners"] = "left_col_scanners"
#
#     return render_template(
#         f"security/app/application-scanners.html",
#         config=payload
#     )

def application_integration_section(context, slot, payload):
    return render_template(
            'security/app/integration_section.html',
            config=payload
        )