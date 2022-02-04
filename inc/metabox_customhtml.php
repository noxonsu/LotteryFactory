<div class="lottery-panel-tab" id="lottery-tab-customhtml">
  <span class="lottery-tab-header">Custom HTML settings</span>
  <table class="form-table">
    <tbody>
      <tr>
        <th scope="row">
          <label><?php esc_html_e( 'Before close tag &lt;/head&gt;', 'lotteryfactory' );?></label>
        </th>
        <td>
          <textarea
            name="lottery_custom_html_before_head_close"
            id="lottery_custom_html_before_head_close"
            class="large-text"
            rows="10"
          ><?php echo $lottery['custom_html_before_head_close']?></textarea>
        </td>
      </tr>
      <tr>
        <th scope="row">
          <label><?php esc_html_e( 'After open tag &lt;body&gt;', 'lotteryfactory' );?></label>
        </th>
        <td>
          <textarea
            name="lottery_custom_html_after_body_open"
            id="lottery_custom_html_after_body_open"
            class="large-text"
            rows="10"
          ><?php echo $lottery['custom_html_after_body_open']?></textarea>
        </td>
      </tr>
      <tr>
        <th scope="row">
          <label><?php esc_html_e( 'Before close tag &lt;/body&gt;', 'lotteryfactory' ); ?></label>
        </th>
        <td>
          <textarea
            name="lottery_custom_html_before_body_close"
            id="lottery_custom_html_before_body_close"
            class="large-text"
            rows="10"
          ><?php echo $lottery['custom_html_before_body_close']?></textarea>
        </td>
      </tr>
    </tbody>
  </table>
  <table class="form-table" style="display: none">
    <tr>
      <th scope="row"></th>
      <td>
        <input type="submit" name="lottery-update-customhtml" id="lottery-update-customhtml" class="button button-primary" value="Update custom HTML" >
      </td>
    </tr>
  </table>
</div>